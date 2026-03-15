#!/usr/bin/env node
/**
 * AgentsMem memory encrypt/decrypt tool (Node.js).
 * Usage: --gen-key | --encrypt | --decrypt with --key, --in, --out; optional --md5 for verify on decrypt.
 */
const crypto = require("crypto");
const fs = require("fs");

function calculateMD5(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(buffer).digest("hex");
}

function getKeystream(keyStr, salt, length) {
  const seed = crypto.pbkdf2Sync(keyStr, salt, 100000, 32, "sha256");
  let stream = Buffer.alloc(0);
  let counter = 0;
  while (stream.length < length) {
    const counterBuf = Buffer.alloc(4);
    counterBuf.writeUInt32BE(counter);
    const hash = crypto.createHash("sha256").update(Buffer.concat([seed, counterBuf])).digest();
    stream = Buffer.concat([stream, hash]);
    counter++;
  }
  return stream.slice(0, length);
}

function processFile(keyStr, inP, outP, isEncrypt, expectedMd5 = null) {
  try {
    if (!fs.existsSync(inP)) {
      console.error("Error: input file not found");
      return;
    }
    if (!isEncrypt && expectedMd5) {
      const actualMd5 = calculateMD5(inP);
      if (actualMd5.toLowerCase() !== expectedMd5.toLowerCase()) {
        console.error(`MD5 mismatch; file may be corrupted. Expected: ${expectedMd5} Actual: ${actualMd5}`);
        return;
      }
      console.log("MD5 OK, decrypting...");
    }
    const data = fs.readFileSync(inP);
    let salt, payload;
    if (isEncrypt) {
      salt = crypto.randomBytes(16);
      payload = data;
    } else {
      salt = data.slice(0, 16);
      payload = data.slice(16);
    }
    const keystream = getKeystream(keyStr, salt, payload.length);
    const res = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i++) res[i] = payload[i] ^ keystream[i];
    if (isEncrypt) {
      fs.writeFileSync(outP, Buffer.concat([salt, res]));
      const md5 = calculateMD5(outP);
      console.log(`Encrypt OK: ${outP}`);
      console.log(`Ciphertext MD5: ${md5} (use this for x-ciphertext-md5 when uploading)`);
    } else {
      fs.writeFileSync(outP, res);
      console.log(`Decrypt OK: ${outP}`);
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

// Simple CLI parsing
const args = process.argv.slice(2);
const p = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) p[args[i].replace("--", "")] = args[i + 1] || true;
}

if (p["gen-key"]) {
  console.log("Key:", crypto.randomBytes(32).toString("base64url"));
} else if (p.encrypt) {
  if (p.key && p.in && p.out) processFile(p.key, p.in, p.out, true);
  else console.log("Usage: node agentsmem_tool.js --encrypt --key KEY --in FILE --out FILE");
} else if (p.decrypt) {
  if (p.key && p.in && p.out) processFile(p.key, p.in, p.out, false, p.md5 || null);
  else console.log("Usage: node agentsmem_tool.js --decrypt --key KEY --in FILE --out FILE [--md5 HEX]");
} else {
  console.log("AgentsMem encrypt/decrypt tool.");
  console.log("Examples:");
  console.log("  node agentsmem_tool.js --gen-key");
  console.log("  node agentsmem_tool.js --encrypt --key K --in F1 --out F2");
  console.log("  node agentsmem_tool.js --decrypt --key K --in F2 --out F3 [--md5 M]");
}
