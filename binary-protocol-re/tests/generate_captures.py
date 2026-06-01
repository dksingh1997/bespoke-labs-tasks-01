#!/usr/bin/env python3
"""Generate MeshLink v2.1 binary capture and expected decoded output.

Produces:
  - environment/workspace/capture.bin
  - environment/workspace/capture_hex.txt
  - tests/expected_output.jsonl   (all 100 decoded messages)

No examples.jsonl — the agent has the full spec document instead.
"""

import json
import os
import random
import struct
import sys

sys.path.insert(0, os.path.dirname(__file__))
from protocol_encoder import MeshLinkEncoder

SEED = 42
BASE_TS = 1700000000000
SEQ_COUNTER = [0]

CLIENT_IDS = [
    "sensor-node-01", "gateway-alpha", "controller-main",
    "edge-device-07", "hub-central", "sensor-node-02",
    "relay-beta", "monitor-03", "actuator-12", "bridge-east",
]

ERROR_MESSAGES = [
    "Connection refused", "Authentication failed", "Channel not found",
    "Rate limit exceeded", "Timeout waiting for response",
    "Invalid payload format", "Unsupported protocol version",
    "Session expired", "Permission denied", "Resource unavailable",
]

COMPRESS_TEXTS = [
    b"AAABBBCCCDDDEEEFFFGGGHHHIIIJJJKKK",
    b"Hello World! This is a test message for compression.",
    b"XXXXXXXXXXXXXXXXXXXX test data with repeats YYYYYY",
    b"abcdefghijklmnopqrstuvwxyz0123456789",
    b"AAAAAAAAAAABBBBBBBBBBBCCCCCCCCCCC",
    b"The quick brown fox jumps over the lazy dog",
    b"zzzzz yyyyy xxxxx wwwww vvvvv",
    b"repeated repeated repeated data data data",
    b"MeshLink protocol test payload number one",
    b"sensor data: temp=22 humidity=45 pressure=1013",
]


def next_seq():
    SEQ_COUNTER[0] += 1
    return SEQ_COUNTER[0]


def rand_bytes(n):
    return bytes([random.randint(0, 255) for _ in range(n)])


def rand_data(min_len=4, max_len=32):
    return rand_bytes(random.randint(min_len, max_len))


def make_hello(enc):
    version = random.randint(1, 5)
    cid = random.choice(CLIENT_IDS)
    return enc.encode_hello(version, cid, priority=random.randint(0, 2))


def make_data(enc):
    channel = random.randint(0, 1023)
    seq = next_seq()
    data = rand_data(4, 48)
    return enc.encode_data(channel, seq, data, priority=random.randint(0, 2))


def make_heartbeat(enc, ts_offset=[0]):
    ts_offset[0] += random.randint(1000, 60000)
    ts = BASE_TS + ts_offset[0]
    flags = random.randint(0, 3)
    return enc.encode_heartbeat(ts, flags, priority=0)


def make_auth(enc):
    method = random.randint(1, 3)
    token = rand_bytes(random.randint(16, 48))
    hmac_bytes = rand_bytes(16)
    return enc.encode_auth(method, token, hmac_bytes, priority=2)


def make_encrypted(enc, key_id=1):
    iv = rand_bytes(8)
    plaintext = rand_data(8, 64)
    return enc.encode_encrypted(key_id, iv, plaintext, priority=random.randint(1, 2))


def make_compressed(enc):
    text = random.choice(COMPRESS_TEXTS)
    return enc.encode_compressed(text, priority=1)


def make_error(enc):
    code = random.choice([100, 200, 301, 400, 401, 403, 404, 500, 502, 503])
    msg = random.choice(ERROR_MESSAGES)
    return enc.encode_error(code, msg, priority=2)


def make_key_exchange(enc, new_key_id):
    key_data = rand_bytes(32)
    return enc.encode_key_exchange(new_key_id, key_data, priority=3)


def make_state_update(enc):
    state_id = random.randint(1, 100000)
    fc = random.randint(1, 5)
    fields = []
    used_ids = set()
    for _ in range(fc):
        fid = random.randint(1, 50)
        while fid in used_ids:
            fid = random.randint(1, 50)
        used_ids.add(fid)
        ftype = random.randint(0, 3)
        if ftype == 0:
            val = random.randint(0, 255)
        elif ftype == 1:
            val = random.randint(0, 65535)
        elif ftype == 2:
            val = random.randint(0, 2**32 - 1)
        else:
            val = random.choice(["active", "idle", "error", "syncing",
                                 "ready", "offline", "standby"])
        fields.append((fid, ftype, val))
    return enc.encode_state_update(state_id, fields, priority=1)


def make_ping(enc):
    ping_id = random.randint(1, 0xFFFFFFFF)
    payload = rand_bytes(random.randint(4, 16))
    return enc.encode_ping(ping_id, payload)


def make_pong(enc, ping_id, payload):
    return enc.encode_pong(ping_id, payload)


def make_batch(enc):
    n = random.randint(2, 4)
    sub_payloads = []
    sub_types = [0x01, 0x02, 0x03, 0x08, 0x0B]
    for _ in range(n):
        st = random.choice(sub_types)
        if st == 0x01:
            version = random.randint(1, 5)
            cid = random.choice(CLIENT_IDS)
            cid_b = cid.encode('utf-8')
            sp = struct.pack('B', 0x01) + struct.pack('B', version) + struct.pack('B', len(cid_b)) + cid_b
        elif st == 0x02:
            channel = random.randint(0, 1023)
            seq = next_seq()
            data = rand_data(4, 24)
            sp = struct.pack('B', 0x02) + struct.pack('>H', channel)
            if enc.auth_received:
                sp += struct.pack('>I', enc.session_id)
            sp += struct.pack('>I', seq) + data
        elif st == 0x03:
            ts = BASE_TS + random.randint(100000, 9000000)
            flags = random.randint(0, 3)
            sp = struct.pack('B', 0x03) + struct.pack('>Q', ts) + struct.pack('B', flags)
        elif st == 0x0B:
            pid = random.randint(1, 0xFFFFFFFF)
            pdata = rand_bytes(random.randint(4, 8))
            sp = struct.pack('B', 0x0B) + struct.pack('>I', pid) + pdata
        else:
            code = random.choice([100, 400, 404, 500])
            msg = random.choice(ERROR_MESSAGES[:5])
            mb = msg.encode('utf-8')
            sp = struct.pack('B', 0x08) + struct.pack('>H', code) + struct.pack('>H', len(mb)) + mb
        sub_payloads.append(sp)
    return enc.encode_batch(sub_payloads, priority=random.randint(1, 2))


def generate():
    random.seed(SEED)
    enc = MeshLinkEncoder()

    # frames = list of bytes (each item is one or more raw frame bytes)
    # For fragmented messages, one logical message produces multiple frames
    all_frames = []  # list of bytes
    jsons = []       # one json per logical message

    frag_id_counter = [0]

    def next_frag_id():
        fid = frag_id_counter[0] % 16
        frag_id_counter[0] += 1
        return fid

    def add(pair):
        frame_bytes, obj = pair
        all_frames.append(frame_bytes)
        jsons.append(obj)

    def add_fragmented(frames_list, obj):
        for fb in frames_list:
            all_frames.append(fb)
        jsons.append(obj)

    # --- fixed sequence (messages 0-59) ---

    # 0-2: HELLO
    for _ in range(3):
        add(make_hello(enc))

    # 3: HEARTBEAT
    add(make_heartbeat(enc))

    # 4-8: DATA (before auth)
    for _ in range(5):
        add(make_data(enc))

    # 9: HEARTBEAT
    add(make_heartbeat(enc))

    # 10: PING
    ping1_id = random.randint(1, 0xFFFFFFFF)
    ping1_payload = rand_bytes(8)
    add(enc.encode_ping(ping1_id, ping1_payload))

    # 11: PONG (response to ping 10)
    add(enc.encode_pong(ping1_id, ping1_payload))

    # 12: AUTH
    add(make_auth(enc))

    # 13: HEARTBEAT
    add(make_heartbeat(enc))

    # 14-20: DATA (after auth, with session_id)
    for _ in range(7):
        add(make_data(enc))

    # 21: HEARTBEAT
    add(make_heartbeat(enc))

    # 22-25: ENCRYPTED (default key, key_id=1)
    for _ in range(4):
        add(make_encrypted(enc, key_id=1))

    # 26: HEARTBEAT
    add(make_heartbeat(enc))

    # 27: KEY_EXCHANGE (new_key_id=2)
    add(make_key_exchange(enc, new_key_id=2))

    # 28-30: ENCRYPTED (key_id=2, new key)
    for _ in range(3):
        add(make_encrypted(enc, key_id=2))

    # 31: HEARTBEAT
    add(make_heartbeat(enc))

    # 32-35: COMPRESSED (normal frames)
    for _ in range(4):
        add(make_compressed(enc))

    # 36: HEARTBEAT
    add(make_heartbeat(enc))

    # 37: FRAGMENTED ENCRYPTED message (key_id=1, large payload split across frames)
    fid = next_frag_id()
    iv = rand_bytes(8)
    plaintext = rand_bytes(80)
    frag_frames, frag_obj = enc.encode_encrypted_fragmented(1, iv, plaintext, fragment_id=fid, priority=2)
    add_fragmented(frag_frames, frag_obj)

    # 38: FRAGMENTED COMPRESSED message (large data split across frames)
    fid = next_frag_id()
    large_text = b"AAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBCCCCCCCCCCCCCCCCCCCC test data repeats here"
    frag_frames2, frag_obj2 = enc.encode_compressed_fragmented(large_text, fragment_id=fid, priority=1)
    add_fragmented(frag_frames2, frag_obj2)

    # 39: FRAGMENTED DATA message
    fid = next_frag_id()
    channel = random.randint(0, 1023)
    seq = next_seq()
    big_data = rand_bytes(70)
    frag_frames3, frag_obj3 = enc.encode_data_fragmented(channel, seq, big_data, fragment_id=fid, priority=1)
    add_fragmented(frag_frames3, frag_obj3)

    # 40: HEARTBEAT
    add(make_heartbeat(enc))

    # 41-43: BATCH
    for _ in range(3):
        add(make_batch(enc))

    # 44: HEARTBEAT
    add(make_heartbeat(enc))

    # 45-47: ERROR
    for _ in range(3):
        add(make_error(enc))

    # 48: HEARTBEAT
    add(make_heartbeat(enc))

    # 49-53: STATE_UPDATE
    for _ in range(5):
        add(make_state_update(enc))

    # 54: HEARTBEAT
    add(make_heartbeat(enc))

    # 55: PING
    ping2_id = random.randint(1, 0xFFFFFFFF)
    ping2_payload = rand_bytes(12)
    add(enc.encode_ping(ping2_id, ping2_payload))

    # 56: Another FRAGMENTED ENCRYPTED (key_id=2)
    fid = next_frag_id()
    iv2 = rand_bytes(8)
    pt2 = rand_bytes(96)
    frag_frames4, frag_obj4 = enc.encode_encrypted_fragmented(2, iv2, pt2, fragment_id=fid, priority=2)
    add_fragmented(frag_frames4, frag_obj4)

    # 57: PONG for ping 55
    add(enc.encode_pong(ping2_id, ping2_payload))

    # 58: KEY_EXCHANGE (new_key_id=3)
    add(make_key_exchange(enc, new_key_id=3))

    # 59: ENCRYPTED (key_id=3)
    add(make_encrypted(enc, key_id=3))

    # --- remaining messages (60-99): random mix ---
    type_choices = [
        'HELLO', 'DATA', 'HEARTBEAT', 'ENCRYPTED_K1', 'ENCRYPTED_K2',
        'ENCRYPTED_K3', 'COMPRESSED', 'BATCH', 'ERROR', 'STATE_UPDATE',
        'PING_PONG', 'FRAG_ENCRYPTED', 'FRAG_DATA',
    ]
    type_weights = [2, 6, 6, 3, 3, 2, 4, 3, 4, 4, 3, 2, 2]

    remaining = 100 - len(jsons)
    i = 0
    while i < remaining:
        choice = random.choices(type_choices, weights=type_weights, k=1)[0]
        if choice == 'HELLO':
            add(make_hello(enc))
        elif choice == 'DATA':
            add(make_data(enc))
        elif choice == 'HEARTBEAT':
            add(make_heartbeat(enc))
        elif choice == 'ENCRYPTED_K1':
            add(make_encrypted(enc, key_id=1))
        elif choice == 'ENCRYPTED_K2':
            add(make_encrypted(enc, key_id=2))
        elif choice == 'ENCRYPTED_K3':
            add(make_encrypted(enc, key_id=3))
        elif choice == 'COMPRESSED':
            add(make_compressed(enc))
        elif choice == 'BATCH':
            add(make_batch(enc))
        elif choice == 'ERROR':
            add(make_error(enc))
        elif choice == 'STATE_UPDATE':
            add(make_state_update(enc))
        elif choice == 'PING_PONG':
            if i + 1 < remaining:
                pid = random.randint(1, 0xFFFFFFFF)
                pdata = rand_bytes(random.randint(4, 16))
                add(enc.encode_ping(pid, pdata))
                add(enc.encode_pong(pid, pdata))
                i += 1  # extra message
            else:
                add(make_heartbeat(enc))
        elif choice == 'FRAG_ENCRYPTED':
            fid = next_frag_id()
            iv = rand_bytes(8)
            pt = rand_bytes(random.randint(60, 100))
            kid = random.choice([1, 2, 3])
            ff, fo = enc.encode_encrypted_fragmented(kid, iv, pt, fragment_id=fid, priority=random.randint(1, 2))
            add_fragmented(ff, fo)
        elif choice == 'FRAG_DATA':
            fid = next_frag_id()
            ch = random.randint(0, 1023)
            sq = next_seq()
            bd = rand_bytes(random.randint(50, 80))
            ff, fo = enc.encode_data_fragmented(ch, sq, bd, fragment_id=fid, priority=1)
            add_fragmented(ff, fo)
        i += 1

    assert len(jsons) == 100, f"Expected 100 messages, got {len(jsons)}"

    return b''.join(all_frames), jsons


def xxd_hex_dump(data):
    lines = []
    for offset in range(0, len(data), 16):
        chunk = data[offset:offset + 16]
        hex_part = ' '.join(f'{b:02x}' for b in chunk)
        ascii_part = ''.join(chr(b) if 0x20 <= b < 0x7F else '.' for b in chunk)
        lines.append(f'{offset:08x}: {hex_part:<48s}  {ascii_part}')
    return '\n'.join(lines) + '\n'


def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ws_dir = os.path.join(base, 'environment', 'workspace')
    tests_dir = os.path.join(base, 'tests')

    os.makedirs(ws_dir, exist_ok=True)
    os.makedirs(tests_dir, exist_ok=True)

    capture_bin, json_objs = generate()

    capture_path = os.path.join(ws_dir, 'capture.bin')
    with open(capture_path, 'wb') as f:
        f.write(capture_bin)
    print(f"Wrote {len(capture_bin)} bytes to {capture_path}")

    hex_path = os.path.join(ws_dir, 'capture_hex.txt')
    with open(hex_path, 'w') as f:
        f.write(xxd_hex_dump(capture_bin))
    print(f"Wrote hex dump to {hex_path}")

    expected_path = os.path.join(tests_dir, 'expected_output.jsonl')
    with open(expected_path, 'w') as f:
        for obj in json_objs:
            f.write(json.dumps(obj, sort_keys=True) + '\n')
    print(f"Wrote {len(json_objs)} expected lines to {expected_path}")

    print(f"\nMessage type distribution:")
    from collections import Counter
    counts = Counter(obj['type'] for obj in json_objs)
    for t, c in sorted(counts.items()):
        print(f"  {t}: {c}")

    with open(capture_path, 'rb') as f:
        data = f.read()
    frame_count = 0
    off = 0
    while off < len(data):
        off += 2
        plen = struct.unpack('>H', data[off:off+2])[0]
        off += 2 + plen + 2
        frame_count += 1
    print(f"\nTotal frames in capture: {frame_count}")
    print(f"Total logical messages: {len(json_objs)}")


if __name__ == '__main__':
    main()
