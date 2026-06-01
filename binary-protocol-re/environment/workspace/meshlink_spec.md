# MeshLink Protocol Specification v2.1

## 1. Overview

MeshLink is a binary protocol for communication between IoT sensor nodes and
gateways. This document specifies the wire format for MeshLink v2.1.

All multi-byte integers are **big-endian** unless otherwise noted.

## 2. Frame Format

Every message is wrapped in a frame:

```
+--------+--------+-----------+---------+-----------+
| Magic  | Length | Flags     | Payload | Checksum  |
| 2B     | 2B     | 1B       | N bytes | 2B        |
+--------+--------+-----------+---------+-----------+
```

- **Magic**: `0xBE 0xEF` (constant)
- **Length**: uint16, byte count of `Flags + Payload` (does NOT include Magic, Length, or Checksum fields)
- **Flags**: 1 byte of frame-level flags (see §2.1)
- **Payload**: variable length, determined by `Length - 1`
- **Checksum**: CRC-16/CCITT-FALSE over the `Flags + Payload` bytes.
  Polynomial `0x1021`, initial value `0xFFFF`, no final XOR.

### 2.1 Frame Flags

```
Bit 7 (MSB): FRAGMENT — this frame is part of a fragmented message
Bit 6:       LAST_FRAGMENT — this is the final fragment (only valid when FRAGMENT=1)
Bits 5-4:    PRIORITY — 0=low, 1=normal, 2=high, 3=critical
Bits 3-0:    FRAGMENT_ID — fragment reassembly group (0-15)
```

When `FRAGMENT=0`, the payload contains a complete message. Ignore `LAST_FRAGMENT`
and `FRAGMENT_ID` in this case; `PRIORITY` is informational only and does not
affect decoding.

When `FRAGMENT=1`, the payload is a fragment. Collect all frames sharing the same
`FRAGMENT_ID`, in the order they appear in the stream. Concatenate their payloads.
The frame with `LAST_FRAGMENT=1` is the final piece. The reassembled payload is
then decoded as a single message. Fragment groups never interleave with other
fragment groups.

## 3. Message Types

The first byte of the (reassembled) payload is the **type code**:

| Code | Type           |
|------|----------------|
| 0x01 | HELLO          |
| 0x02 | DATA           |
| 0x03 | HEARTBEAT      |
| 0x04 | AUTH           |
| 0x05 | ENCRYPTED      |
| 0x06 | COMPRESSED     |
| 0x07 | BATCH          |
| 0x08 | ERROR          |
| 0x09 | KEY_EXCHANGE   |
| 0x0A | STATE_UPDATE   |
| 0x0B | PING           |
| 0x0C | PONG           |

### 3.1 HELLO (0x01)

```
+------+---------+--------+-----+
| Type | Version | CID_Len| CID |
| 1B   | 1B      | 1B     | var |
+------+---------+--------+-----+
```

- **Version**: uint8, protocol version claimed by sender
- **CID_Len**: uint8, length of Client ID string
- **CID**: UTF-8 encoded client identifier

Output fields: `type`, `version`, `client_id`

### 3.2 DATA (0x02)

```
+------+---------+-------+---------+------+
| Type | Channel | [SID] | Seq_Num | Data |
| 1B   | 2B      | [4B]  | 4B      | var  |
+------+---------+-------+---------+------+
```

- **Channel**: uint16
- **SID** (Session ID): uint32, **present only if an AUTH message has been
  previously received** in this stream. See §4 for session semantics.
- **Seq_Num**: uint32, monotonic sequence number
- **Data**: remaining bytes (raw binary)

Output fields: `type`, `channel`, `seq_num`, `data` (hex string).
Include `session_id` (as integer) only when SID is present.

### 3.3 HEARTBEAT (0x03)

```
+------+-----------+-------+
| Type | Timestamp | Flags |
| 1B   | 8B        | 1B    |
+------+-----------+-------+
```

- **Timestamp**: uint64, milliseconds since epoch
- **Flags**: uint8

Output fields: `type`, `timestamp`, `flags`

### 3.4 AUTH (0x04)

```
+------+--------+----------+-------+------+
| Type | Method | Token_Len| Token | HMAC |
| 1B   | 1B     | 2B       | var   | 16B  |
+------+--------+----------+-------+------+
```

- **Method**: uint8 (1=password, 2=certificate, 3=token)
- **Token_Len**: uint16, length of the token
- **Token**: authentication token bytes
- **HMAC**: 16 bytes, HMAC-MD5 authentication code

**Side effect**: The first AUTH message in a stream activates **session mode**.
The Session ID is computed as `uint32_be(HMAC[12..16])` — i.e., the last 4 bytes
of the HMAC field interpreted as a big-endian uint32. All subsequent DATA messages
(§3.2) will include the Session ID field. Multiple AUTH messages do not change
the Session ID; only the first one takes effect.

Output fields: `type`, `method`, `token` (hex string), `hmac` (hex string)

### 3.5 ENCRYPTED (0x05)

```
+------+--------+----+------------------+
| Type | Key_ID | IV | Encrypted_Data   |
| 1B   | 1B     | 8B | var              |
+------+--------+----+------------------+
```

- **Key_ID**: uint8, identifies which key to use for decryption
- **IV**: 8 bytes, initialization vector (included in output but not used for decryption in this protocol version)
- **Encrypted_Data**: XOR-encrypted payload

**Decryption**: `plaintext[i] = encrypted[i] XOR key[i % 16]`

The 16-byte key is looked up by Key_ID:
- **Default keys** (used when no KEY_EXCHANGE has set a key for that ID):
  `key[i] = ((key_id * 37 + i * 13 + 7) & 0xFF)` for `i` in `0..15`
- **Exchanged keys** override the default. See §3.9.

Output fields: `type`, `key_id`, `iv` (hex string), `decrypted_payload` (hex string)

### 3.6 COMPRESSED (0x06)

```
+------+--------------+----------+
| Type | Original_Len | RLE_Data |
| 1B   | 4B           | var      |
+------+--------------+----------+
```

- **Original_Len**: uint32, byte length of the decompressed data
- **RLE_Data**: Run-Length Encoded payload (see §5)

Output fields: `type`, `original_len`, `data` (hex string of the decompressed data)

### 3.7 BATCH (0x07)

```
+------+-------+----------------------------+
| Type | Count | Sub-messages               |
| 1B   | 2B    | repeated (Count times)     |
+------+-------+----------------------------+
```

Each sub-message:
```
+----------+----------+-------------+
| Sub_Type | Sub_Len  | Sub_Payload |
| 1B       | 2B       | var         |
+----------+----------+-------------+
```

- **Count**: uint16, number of sub-messages
- **Sub_Type**: the message type code of the sub-message
- **Sub_Len**: uint16, length of Sub_Payload (excludes Sub_Type)
- **Sub_Payload**: the fields of the sub-message (same layout as §3.x but without the type byte)

Sub-messages are decoded using the same rules as top-level messages. Stateful
effects (e.g., AUTH) inside a BATCH apply to subsequent messages normally.

Output fields: `type`, `count`, `messages` (array of decoded sub-message objects)

### 3.8 ERROR (0x08)

```
+------+------+---------+---------+
| Type | Code | Msg_Len | Message |
| 1B   | 2B   | 2B      | var     |
+------+------+---------+---------+
```

- **Code**: uint16, error code
- **Msg_Len**: uint16, length of the message string
- **Message**: UTF-8 encoded error description

Output fields: `type`, `code`, `message`

### 3.9 KEY_EXCHANGE (0x09)

```
+------+------------+--------------------+
| Type | New_Key_ID | Encrypted_Key_Data |
| 1B   | 1B         | 32B                |
+------+------------+--------------------+
```

- **New_Key_ID**: uint8, the key ID being installed
- **Encrypted_Key_Data**: 32 bytes

**Key derivation**: The actual 16-byte encryption key is obtained by XOR-ing
each of the first 16 bytes of `Encrypted_Key_Data` with `0xAA`:

```
new_key[i] = encrypted_key_data[i] XOR 0xAA    for i in 0..15
```

This key replaces the default key for `New_Key_ID`. Subsequent ENCRYPTED messages
using that Key_ID will use the new key.

Output fields: `type`, `new_key_id`, `encrypted_key_data` (hex string of all 32 bytes)

### 3.10 STATE_UPDATE (0x0A)

```
+------+----------+-------------+------------------+
| Type | State_ID | Field_Count | Fields (repeated)|
| 1B   | 4B       | 1B          | var              |
+------+----------+-------------+------------------+
```

Each field:
```
+----------+------------+-----------+
| Field_ID | Field_Type | Value     |
| 1B       | 1B         | var       |
+----------+------------+-----------+
```

Field_Type determines the value encoding:

| Field_Type | Value encoding          |
|------------|-------------------------|
| 0          | uint8 (1 byte)          |
| 1          | uint16 (2 bytes)        |
| 2          | uint32 (4 bytes)        |
| 3          | length-prefixed string: uint16 length + UTF-8 bytes |

Output fields: `type`, `state_id`, `fields` (array of objects with `field_id`, `field_type`, `value`)

### 3.11 PING (0x0B)

```
+------+-----------+---------+
| Type | Ping_ID   | Payload |
| 1B   | 4B        | var     |
+------+-----------+---------+
```

- **Ping_ID**: uint32, identifier for the ping (to match with PONG)
- **Payload**: arbitrary echo data (remaining bytes)

Output fields: `type`, `ping_id`, `payload` (hex string)

### 3.12 PONG (0x0C)

```
+------+-----------+---------+
| Type | Ping_ID   | Payload |
| 1B   | 4B        | var     |
+------+-----------+---------+
```

- **Ping_ID**: uint32, must match the corresponding PING
- **Payload**: echoed data from the original PING

Output fields: `type`, `ping_id`, `payload` (hex string)

## 4. Session Semantics

The stream starts in **unauthenticated mode**. DATA messages do not include
the Session ID field.

When the first AUTH message (§3.4) is processed, the decoder transitions to
**authenticated mode**. The Session ID is derived from the AUTH message's HMAC
field: `session_id = uint32_be(HMAC[12..16])`.

All DATA messages after this point (including DATA sub-messages inside BATCH)
include the 4-byte Session ID field between Channel and Seq_Num.

Only the first AUTH message activates session mode. Subsequent AUTH messages
are decoded normally but do not change the session state.

## 5. Run-Length Encoding (RLE)

Used by COMPRESSED messages (§3.6). All original data bytes are guaranteed to
be in the range `0x00..0x7F` (ASCII).

The RLE stream is decoded byte-by-byte:

1. Read a byte `b`.
2. If bit 7 is **clear** (`b < 0x80`): emit `b` as a literal byte.
3. If bit 7 is **set** (`b >= 0x80`): the character is `b & 0x7F`.
   Read the next byte `count`. Emit the character `count` times.

## 6. Output Format

For each message in the capture (in order), output one line of JSON to stdout.
Use **sorted keys**. Binary data fields must be represented as **lowercase hex
strings**. Integer fields are JSON numbers. String fields are JSON strings.
