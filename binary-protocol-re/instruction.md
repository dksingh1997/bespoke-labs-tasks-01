# Implement a MeshLink Protocol Decoder

You are given a complete protocol specification and a binary capture file. Your task is to implement a decoder that correctly parses all 100 messages.

## Files Provided

- `/app/workspace/meshlink_spec.md` — Full MeshLink v2.1 protocol specification
- `/app/workspace/capture.bin` — Binary capture containing 100 sequential MeshLink messages
- `/app/workspace/capture_hex.txt` — Hex dump of the capture file for inspection

## Your Task

Read the specification carefully and implement a decoder.

### Requirements

1. Create an executable at `/app/workspace/decoder` (any language: Python, Node.js, shell, etc.)
2. The decoder takes the binary file path as its first argument: `./decoder /app/workspace/capture.bin`
3. It outputs one JSON line per decoded message to stdout (100 lines total)
4. Each JSON line must contain the fields specified in the protocol spec for that message type
5. Use sorted keys in JSON output for consistency

### Key Implementation Challenges

The protocol has several features that require careful implementation:

- **CRC-16 checksum** validation on every frame
- **Frame flags** including a priority field and fragment control bits
- **Message fragmentation** — some messages are split across multiple frames and must be reassembled before decoding
- **Stateful parsing** — AUTH messages change how subsequent DATA messages are parsed
- **XOR encryption** with multiple key IDs and a key exchange mechanism
- **Run-length encoding** for compressed messages
- **Nested messages** inside BATCH frames
- **Multiple message types** (12 total) with different field layouts

### Scoring

Your score is the fraction of messages correctly decoded: `correct / 100`. A message is correct if and only if the JSON output matches the expected output exactly (all fields present with correct values, key-order independent comparison).

### Tools Available

- Python 3
- Node.js
- Standard Unix utilities (xxd, hexdump, od, etc.)
