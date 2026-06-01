#!/usr/bin/env python3
"""MeshLink v2.1 protocol decoder (oracle).

Reads a binary capture file and outputs one JSON line per decoded message.
Handles CRC-16, frame flags, fragmentation, and all message types.
"""

import struct
import sys
import json


def crc16_ccitt(data: bytes) -> int:
    """CRC-16/CCITT-FALSE: poly=0x1021, init=0xFFFF, no final XOR."""
    crc = 0xFFFF
    for b in data:
        crc ^= b << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = (crc << 1) ^ 0x1021
            else:
                crc = crc << 1
            crc &= 0xFFFF
    return crc


class MeshLinkDecoder:
    def __init__(self):
        self.auth_received = False
        self.session_id = None
        self.key_store = {}

    @staticmethod
    def default_key(key_id):
        return bytes([((key_id * 37 + i * 13 + 7) & 0xFF) for i in range(16)])

    def get_key(self, key_id):
        if key_id in self.key_store:
            return self.key_store[key_id]
        return self.default_key(key_id)

    @staticmethod
    def rle_decode(data):
        result = bytearray()
        i = 0
        while i < len(data):
            b = data[i]
            if b & 0x80:
                actual = b & 0x7F
                count = data[i + 1]
                result.extend([actual] * count)
                i += 2
            else:
                result.append(b)
                i += 1
        return bytes(result)

    def decode_payload(self, payload):
        msg_type = payload[0]
        rest = payload[1:]

        if msg_type == 0x01:  # HELLO
            version = rest[0]
            cid_len = rest[1]
            cid = rest[2:2 + cid_len].decode('utf-8')
            return {"type": "HELLO", "version": version, "client_id": cid}

        elif msg_type == 0x02:  # DATA
            off = 0
            channel = struct.unpack('>H', rest[off:off + 2])[0]
            off += 2
            result = {"type": "DATA", "channel": channel}
            if self.auth_received:
                session_id = struct.unpack('>I', rest[off:off + 4])[0]
                off += 4
                result["session_id"] = session_id
            seq_num = struct.unpack('>I', rest[off:off + 4])[0]
            off += 4
            data = rest[off:]
            result["seq_num"] = seq_num
            result["data"] = data.hex()
            return result

        elif msg_type == 0x03:  # HEARTBEAT
            ts = struct.unpack('>Q', rest[0:8])[0]
            flags = rest[8]
            return {"type": "HEARTBEAT", "timestamp": ts, "flags": flags}

        elif msg_type == 0x04:  # AUTH
            method = rest[0]
            token_len = struct.unpack('>H', rest[1:3])[0]
            token = rest[3:3 + token_len]
            hmac = rest[3 + token_len:3 + token_len + 16]
            result = {"type": "AUTH", "method": method,
                      "token": token.hex(), "hmac": hmac.hex()}
            if not self.auth_received:
                self.auth_received = True
                self.session_id = struct.unpack('>I', hmac[-4:])[0]
            return result

        elif msg_type == 0x05:  # ENCRYPTED
            key_id = rest[0]
            iv = rest[1:9]
            encrypted = rest[9:]
            key = self.get_key(key_id)
            decrypted = bytes([encrypted[i] ^ key[i % len(key)]
                               for i in range(len(encrypted))])
            return {"type": "ENCRYPTED", "key_id": key_id,
                    "iv": iv.hex(), "decrypted_payload": decrypted.hex()}

        elif msg_type == 0x06:  # COMPRESSED
            original_len = struct.unpack('>I', rest[0:4])[0]
            rle_data = rest[4:]
            decompressed = self.rle_decode(rle_data)
            return {"type": "COMPRESSED", "original_len": original_len,
                    "data": decompressed.hex()}

        elif msg_type == 0x07:  # BATCH
            count = struct.unpack('>H', rest[0:2])[0]
            off = 2
            messages = []
            for _ in range(count):
                sub_type = rest[off]
                sub_len = struct.unpack('>H', rest[off + 1:off + 3])[0]
                sub_payload = rest[off + 3:off + 3 + sub_len]
                inner = bytes([sub_type]) + sub_payload
                messages.append(self.decode_payload(inner))
                off += 3 + sub_len
            return {"type": "BATCH", "count": count, "messages": messages}

        elif msg_type == 0x08:  # ERROR
            code = struct.unpack('>H', rest[0:2])[0]
            msg_len = struct.unpack('>H', rest[2:4])[0]
            message = rest[4:4 + msg_len].decode('utf-8')
            return {"type": "ERROR", "code": code, "message": message}

        elif msg_type == 0x09:  # KEY_EXCHANGE
            new_key_id = rest[0]
            enc_key_data = rest[1:33]
            new_key = bytes([(b ^ 0xAA) for b in enc_key_data[:16]])
            self.key_store[new_key_id] = new_key
            return {"type": "KEY_EXCHANGE", "new_key_id": new_key_id,
                    "encrypted_key_data": enc_key_data.hex()}

        elif msg_type == 0x0A:  # STATE_UPDATE
            state_id = struct.unpack('>I', rest[0:4])[0]
            field_count = rest[4]
            off = 5
            fields = []
            for _ in range(field_count):
                fid = rest[off]
                ftype = rest[off + 1]
                off += 2
                if ftype == 0:
                    val = rest[off]; off += 1
                elif ftype == 1:
                    val = struct.unpack('>H', rest[off:off + 2])[0]; off += 2
                elif ftype == 2:
                    val = struct.unpack('>I', rest[off:off + 4])[0]; off += 4
                elif ftype == 3:
                    slen = struct.unpack('>H', rest[off:off + 2])[0]; off += 2
                    val = rest[off:off + slen].decode('utf-8'); off += slen
                else:
                    val = rest[off:].hex(); off = len(rest)
                fields.append({"field_id": fid, "field_type": ftype, "value": val})
            return {"type": "STATE_UPDATE", "state_id": state_id, "fields": fields}

        elif msg_type == 0x0B:  # PING
            ping_id = struct.unpack('>I', rest[0:4])[0]
            payload_data = rest[4:]
            return {"type": "PING", "ping_id": ping_id, "payload": payload_data.hex()}

        elif msg_type == 0x0C:  # PONG
            ping_id = struct.unpack('>I', rest[0:4])[0]
            payload_data = rest[4:]
            return {"type": "PONG", "ping_id": ping_id, "payload": payload_data.hex()}

        else:
            return {"type": "UNKNOWN", "type_id": msg_type, "payload": rest.hex()}

    def decode_stream(self, data):
        messages = []
        offset = 0
        fragment_buffers = {}  # fragment_id -> list of payload chunks

        while offset < len(data):
            if data[offset] != 0xBE or data[offset + 1] != 0xEF:
                raise ValueError(f"Bad magic at offset {offset}")
            offset += 2
            body_len = struct.unpack('>H', data[offset:offset + 2])[0]
            offset += 2
            body = data[offset:offset + body_len]
            offset += body_len
            crc_expected = struct.unpack('>H', data[offset:offset + 2])[0]
            offset += 2
            crc_actual = crc16_ccitt(body)
            if crc_actual != crc_expected:
                raise ValueError(f"CRC mismatch at offset {offset - 2}: expected {crc_expected:#06x}, got {crc_actual:#06x}")

            flags_byte = body[0]
            payload = body[1:]

            is_fragment = bool(flags_byte & 0x80)
            is_last = bool(flags_byte & 0x40)
            fragment_id = flags_byte & 0x0F

            if not is_fragment:
                messages.append(self.decode_payload(payload))
            else:
                if fragment_id not in fragment_buffers:
                    fragment_buffers[fragment_id] = []
                fragment_buffers[fragment_id].append(payload)
                if is_last:
                    reassembled = b''.join(fragment_buffers.pop(fragment_id))
                    messages.append(self.decode_payload(reassembled))

        return messages


def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <capture_file>", file=sys.stderr)
        sys.exit(1)

    with open(sys.argv[1], 'rb') as f:
        data = f.read()

    decoder = MeshLinkDecoder()
    for msg in decoder.decode_stream(data):
        print(json.dumps(msg, sort_keys=True))


if __name__ == '__main__':
    main()
