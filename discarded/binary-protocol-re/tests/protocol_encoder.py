#!/usr/bin/env python3
"""MeshLink v2.1 protocol encoder.

Encodes messages into the MeshLink binary wire format.
Used by generate_captures.py to produce test captures.
"""

import struct


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


class MeshLinkEncoder:
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
    def frame(payload, flags=0x00):
        """Build a frame with the given flags byte and CRC-16."""
        magic = b'\xBE\xEF'
        flags_byte = bytes([flags & 0xFF])
        body = flags_byte + payload
        length = struct.pack('>H', len(body))
        checksum = struct.pack('>H', crc16_ccitt(body))
        return magic + length + body + checksum

    @staticmethod
    def frame_fragmented(payload, fragment_id, priority=1):
        """Split payload into fragments. Returns list of frame bytes."""
        chunk_size = 32
        chunks = []
        for i in range(0, len(payload), chunk_size):
            chunks.append(payload[i:i + chunk_size])

        frames = []
        for idx, chunk in enumerate(chunks):
            is_last = (idx == len(chunks) - 1)
            flags = 0x80 | (fragment_id & 0x0F)
            if is_last:
                flags |= 0x40
            flags |= ((priority & 0x03) << 4)
            frames.append(MeshLinkEncoder.frame(chunk, flags=flags))
        return frames

    # ---- payload builders ----

    def _hello_payload(self, version, client_id):
        cid = client_id.encode('utf-8')
        return struct.pack('B', 0x01) + struct.pack('B', version) + struct.pack('B', len(cid)) + cid

    def _data_payload(self, channel, seq_num, data):
        p = struct.pack('B', 0x02) + struct.pack('>H', channel)
        if self.auth_received:
            p += struct.pack('>I', self.session_id)
        p += struct.pack('>I', seq_num) + data
        return p

    def _heartbeat_payload(self, timestamp, flags):
        return struct.pack('B', 0x03) + struct.pack('>Q', timestamp) + struct.pack('B', flags)

    def _auth_payload(self, method, token, hmac_bytes):
        return (struct.pack('B', 0x04) + struct.pack('B', method) +
                struct.pack('>H', len(token)) + token + hmac_bytes)

    def _encrypted_payload(self, key_id, iv, plaintext):
        key = self.get_key(key_id)
        encrypted = bytes([plaintext[i] ^ key[i % len(key)] for i in range(len(plaintext))])
        return struct.pack('B', 0x05) + struct.pack('B', key_id) + iv + encrypted

    @staticmethod
    def rle_encode(data):
        result = bytearray()
        i = 0
        while i < len(data):
            j = i + 1
            while j < len(data) and data[j] == data[i] and (j - i) < 255:
                j += 1
            run_len = j - i
            if run_len >= 2:
                result.append(data[i] | 0x80)
                result.append(run_len)
            else:
                result.append(data[i])
            i = j
        return bytes(result)

    def _compressed_payload(self, original_data):
        rle_data = self.rle_encode(original_data)
        return struct.pack('B', 0x06) + struct.pack('>I', len(original_data)) + rle_data

    def _batch_payload(self, sub_payloads):
        p = struct.pack('B', 0x07) + struct.pack('>H', len(sub_payloads))
        for sub in sub_payloads:
            sub_type = sub[0:1]
            sub_rest = sub[1:]
            p += sub_type + struct.pack('>H', len(sub_rest)) + sub_rest
        return p

    def _error_payload(self, code, message):
        msg_bytes = message.encode('utf-8')
        return (struct.pack('B', 0x08) + struct.pack('>H', code) +
                struct.pack('>H', len(msg_bytes)) + msg_bytes)

    def _key_exchange_payload(self, new_key_id, encrypted_key_data):
        return struct.pack('B', 0x09) + struct.pack('B', new_key_id) + encrypted_key_data

    def _state_update_payload(self, state_id, fields):
        p = struct.pack('B', 0x0A) + struct.pack('>I', state_id) + struct.pack('B', len(fields))
        for fid, ftype, val in fields:
            p += struct.pack('B', fid) + struct.pack('B', ftype)
            if ftype == 0:
                p += struct.pack('B', val)
            elif ftype == 1:
                p += struct.pack('>H', val)
            elif ftype == 2:
                p += struct.pack('>I', val)
            elif ftype == 3:
                s = val.encode('utf-8')
                p += struct.pack('>H', len(s)) + s
        return p

    def _ping_payload(self, ping_id, payload_data):
        return struct.pack('B', 0x0B) + struct.pack('>I', ping_id) + payload_data

    def _pong_payload(self, ping_id, payload_data):
        return struct.pack('B', 0x0C) + struct.pack('>I', ping_id) + payload_data

    # ---- framed message encoders ----

    def encode_hello(self, version, client_id, priority=1):
        payload = self._hello_payload(version, client_id)
        obj = {"type": "HELLO", "version": version, "client_id": client_id}
        flags = (priority & 0x03) << 4
        return self.frame(payload, flags=flags), obj

    def encode_data(self, channel, seq_num, data, priority=1):
        payload = self._data_payload(channel, seq_num, data)
        obj = {"type": "DATA", "channel": channel, "seq_num": seq_num, "data": data.hex()}
        if self.auth_received:
            obj["session_id"] = self.session_id
        flags = (priority & 0x03) << 4
        return self.frame(payload, flags=flags), obj

    def encode_heartbeat(self, timestamp, hb_flags, priority=0):
        payload = self._heartbeat_payload(timestamp, hb_flags)
        obj = {"type": "HEARTBEAT", "timestamp": timestamp, "flags": hb_flags}
        flags = (priority & 0x03) << 4
        return self.frame(payload, flags=flags), obj

    def encode_auth(self, method, token, hmac_bytes, priority=2):
        assert len(hmac_bytes) == 16
        payload = self._auth_payload(method, token, hmac_bytes)
        obj = {"type": "AUTH", "method": method, "token": token.hex(), "hmac": hmac_bytes.hex()}
        if not self.auth_received:
            self.auth_received = True
            self.session_id = struct.unpack('>I', hmac_bytes[-4:])[0]
        flags = (priority & 0x03) << 4
        return self.frame(payload, flags=flags), obj

    def encode_encrypted(self, key_id, iv, plaintext, priority=1):
        assert len(iv) == 8
        payload = self._encrypted_payload(key_id, iv, plaintext)
        obj = {"type": "ENCRYPTED", "key_id": key_id,
               "iv": iv.hex(), "decrypted_payload": plaintext.hex()}
        flags = (priority & 0x03) << 4
        return self.frame(payload, flags=flags), obj

    def encode_compressed(self, original_data, priority=1):
        payload = self._compressed_payload(original_data)
        obj = {"type": "COMPRESSED", "original_len": len(original_data),
               "data": original_data.hex()}
        flags = (priority & 0x03) << 4
        return self.frame(payload, flags=flags), obj

    def encode_batch(self, sub_payloads, priority=1):
        payload = self._batch_payload(sub_payloads)
        sub_objs = []
        for sub in sub_payloads:
            sub_objs.append(self._decode_sub_payload(sub))
        obj = {"type": "BATCH", "count": len(sub_payloads), "messages": sub_objs}
        flags = (priority & 0x03) << 4
        return self.frame(payload, flags=flags), obj

    def encode_error(self, code, message, priority=2):
        payload = self._error_payload(code, message)
        obj = {"type": "ERROR", "code": code, "message": message}
        flags = (priority & 0x03) << 4
        return self.frame(payload, flags=flags), obj

    def encode_key_exchange(self, new_key_id, encrypted_key_data, priority=3):
        assert len(encrypted_key_data) == 32
        payload = self._key_exchange_payload(new_key_id, encrypted_key_data)
        obj = {"type": "KEY_EXCHANGE", "new_key_id": new_key_id,
               "encrypted_key_data": encrypted_key_data.hex()}
        new_key = bytes([(b ^ 0xAA) for b in encrypted_key_data[:16]])
        self.key_store[new_key_id] = new_key
        flags = (priority & 0x03) << 4
        return self.frame(payload, flags=flags), obj

    def encode_state_update(self, state_id, fields, priority=1):
        payload = self._state_update_payload(state_id, fields)
        field_objs = []
        for fid, ftype, val in fields:
            field_objs.append({"field_id": fid, "field_type": ftype, "value": val})
        obj = {"type": "STATE_UPDATE", "state_id": state_id, "fields": field_objs}
        flags = (priority & 0x03) << 4
        return self.frame(payload, flags=flags), obj

    def encode_ping(self, ping_id, payload_data, priority=0):
        payload = self._ping_payload(ping_id, payload_data)
        obj = {"type": "PING", "ping_id": ping_id, "payload": payload_data.hex()}
        flags = (priority & 0x03) << 4
        return self.frame(payload, flags=flags), obj

    def encode_pong(self, ping_id, payload_data, priority=0):
        payload = self._pong_payload(ping_id, payload_data)
        obj = {"type": "PONG", "ping_id": ping_id, "payload": payload_data.hex()}
        flags = (priority & 0x03) << 4
        return self.frame(payload, flags=flags), obj

    def encode_fragmented(self, payload_builder_func, *args, fragment_id=0, priority=1, **kwargs):
        """Encode a message as fragmented frames. Returns (list_of_frame_bytes, json_obj)."""
        if hasattr(self, payload_builder_func):
            payload = getattr(self, payload_builder_func)(*args, **kwargs)
        else:
            raise ValueError(f"Unknown builder: {payload_builder_func}")
        frames = self.frame_fragmented(payload, fragment_id, priority)
        return frames, None

    def encode_encrypted_fragmented(self, key_id, iv, plaintext, fragment_id=0, priority=1):
        """Encode an ENCRYPTED message split across fragments."""
        payload = self._encrypted_payload(key_id, iv, plaintext)
        obj = {"type": "ENCRYPTED", "key_id": key_id,
               "iv": iv.hex(), "decrypted_payload": plaintext.hex()}
        frames = self.frame_fragmented(payload, fragment_id, priority)
        return frames, obj

    def encode_compressed_fragmented(self, original_data, fragment_id=0, priority=1):
        """Encode a COMPRESSED message split across fragments."""
        payload = self._compressed_payload(original_data)
        obj = {"type": "COMPRESSED", "original_len": len(original_data),
               "data": original_data.hex()}
        frames = self.frame_fragmented(payload, fragment_id, priority)
        return frames, obj

    def encode_data_fragmented(self, channel, seq_num, data, fragment_id=0, priority=1):
        """Encode a DATA message split across fragments."""
        payload = self._data_payload(channel, seq_num, data)
        obj = {"type": "DATA", "channel": channel, "seq_num": seq_num, "data": data.hex()}
        if self.auth_received:
            obj["session_id"] = self.session_id
        frames = self.frame_fragmented(payload, fragment_id, priority)
        return frames, obj

    def _decode_sub_payload(self, payload):
        msg_type = payload[0]
        rest = payload[1:]

        if msg_type == 0x01:
            version = rest[0]
            cid_len = rest[1]
            cid = rest[2:2 + cid_len].decode('utf-8')
            return {"type": "HELLO", "version": version, "client_id": cid}

        elif msg_type == 0x02:
            off = 0
            channel = struct.unpack('>H', rest[off:off + 2])[0]
            off += 2
            result = {"type": "DATA", "channel": channel}
            if self.auth_received:
                result["session_id"] = struct.unpack('>I', rest[off:off + 4])[0]
                off += 4
            seq_num = struct.unpack('>I', rest[off:off + 4])[0]
            off += 4
            data = rest[off:]
            result["seq_num"] = seq_num
            result["data"] = data.hex()
            return result

        elif msg_type == 0x03:
            ts = struct.unpack('>Q', rest[0:8])[0]
            flags = rest[8]
            return {"type": "HEARTBEAT", "timestamp": ts, "flags": flags}

        elif msg_type == 0x08:
            code = struct.unpack('>H', rest[0:2])[0]
            mlen = struct.unpack('>H', rest[2:4])[0]
            msg = rest[4:4 + mlen].decode('utf-8')
            return {"type": "ERROR", "code": code, "message": msg}

        elif msg_type == 0x0A:
            state_id = struct.unpack('>I', rest[0:4])[0]
            fc = rest[4]
            off = 5
            fields = []
            for _ in range(fc):
                fid = rest[off]
                ft = rest[off + 1]
                off += 2
                if ft == 0:
                    val = rest[off]; off += 1
                elif ft == 1:
                    val = struct.unpack('>H', rest[off:off + 2])[0]; off += 2
                elif ft == 2:
                    val = struct.unpack('>I', rest[off:off + 4])[0]; off += 4
                elif ft == 3:
                    slen = struct.unpack('>H', rest[off:off + 2])[0]; off += 2
                    val = rest[off:off + slen].decode('utf-8'); off += slen
                else:
                    val = None
                fields.append({"field_id": fid, "field_type": ft, "value": val})
            return {"type": "STATE_UPDATE", "state_id": state_id, "fields": fields}

        elif msg_type == 0x0B:
            ping_id = struct.unpack('>I', rest[0:4])[0]
            return {"type": "PING", "ping_id": ping_id, "payload": rest[4:].hex()}

        elif msg_type == 0x0C:
            ping_id = struct.unpack('>I', rest[0:4])[0]
            return {"type": "PONG", "ping_id": ping_id, "payload": rest[4:].hex()}

        else:
            return {"type": "UNKNOWN", "type_id": msg_type, "payload": rest.hex()}
