#!/usr/bin/env python3
"""
AgentsMem memory encrypt/decrypt tool (Python).
Usage: --gen-key | --encrypt | --decrypt with --key, --in, --out; optional --md5 for verify on decrypt.
"""
import os
import hashlib
import argparse
import secrets

def calculate_md5(file_path):
    """Compute MD5 of file."""
    h = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            h.update(chunk)
    return h.hexdigest()

def get_keystream(key_str, salt, length):
    seed = hashlib.pbkdf2_hmac("sha256", key_str.encode(), salt, 100000, 32)
    stream = bytearray()
    counter = 0
    while len(stream) < length:
        block = hashlib.sha256(seed + counter.to_bytes(4, "big")).digest()
        stream.extend(block)
        counter += 1
    return stream[:length]

def encrypt_file(key_str, in_p, out_p):
    if not os.path.isfile(in_p):
        print("Error: source file not found")
        return
    salt = os.urandom(16)
    with open(in_p, "rb") as f:
        data = f.read()
    keystream = get_keystream(key_str, salt, len(data))
    res = bytes([b ^ k for b, k in zip(data, keystream)])
    with open(out_p, "wb") as f:
        f.write(salt + res)
    md5_val = calculate_md5(out_p)
    print(f"Encrypt OK: {out_p}")
    print(f"Ciphertext MD5: {md5_val} (use this for x-ciphertext-md5 when uploading)")

def decrypt_file(key_str, in_p, out_p, expected_md5=None):
    if not os.path.isfile(in_p):
        print("Error: encrypted file not found")
        return
    if expected_md5:
        actual_md5 = calculate_md5(in_p)
        if actual_md5.lower() != expected_md5.lower():
            print(f"MD5 mismatch; file may be corrupted. Expected: {expected_md5} Actual: {actual_md5}")
            return
        print("MD5 OK, decrypting...")
    with open(in_p, "rb") as f:
        data = f.read()
    salt, payload = data[:16], data[16:]
    keystream = get_keystream(key_str, salt, len(payload))
    res = bytes([b ^ k for b, k in zip(payload, keystream)])
    with open(out_p, "wb") as f:
        f.write(res)
    print(f"Decrypt OK: {out_p}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AgentsMem encrypt/decrypt tool (Python)")
    parser.add_argument("--gen-key", action="store_true", help="Generate a new encryption key")
    parser.add_argument("--encrypt", action="store_true")
    parser.add_argument("--decrypt", action="store_true")
    parser.add_argument("--key", type=str, help="Encryption key")
    parser.add_argument("--in", dest="in_p", metavar="FILE", help="Input file")
    parser.add_argument("--out", dest="out_p", metavar="FILE", help="Output file")
    parser.add_argument("--md5", dest="check_md5", type=str, help="Verify ciphertext MD5 before decrypt (optional)")
    args = parser.parse_args()

    if args.gen_key:
        print(f"Key: {secrets.token_urlsafe(32)}")
    elif args.encrypt and args.key and args.in_p and args.out_p:
        encrypt_file(args.key, args.in_p, args.out_p)
    elif args.decrypt and args.key and args.in_p and args.out_p:
        decrypt_file(args.key, args.in_p, args.out_p, args.check_md5)
    else:
        parser.print_help()
