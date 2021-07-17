// @ts-nocheck
/**
 * Browser ecies-parity implementation.
 *
 * This is based of the eccrypto js module
 *
 * Imported from https://github.com/sigp/ecies-parity with some changes:
 * - Remove PARITY_DEFAULT_HMAC
 * - Use const instead of var/let
 * - Use node: crypto instead of subtle
 * - Use pure javascript libraries to support react-native expo
 */

// import * as randomBytes from 'randombytes-pure';
import { randomBytes } from 'crypto';
// import * as EL from 'elliptic';
import eli from 'elliptic';


// const EC = EL.ec;

// const randomBytes = require("randombytes-pure").default;
// const EC = require("elliptic").ec;
const ec = new eli.ec("secp256k1");

// const jsSHA = require("jssha");
import jsSHA from 'jssha'

import aesjs from 'aes-js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// The KDF as implemented in Parity
const kdf = function (secret, outputLength) {
  let ctr = 1;
  let written = 0;
  let result = Buffer.from('');
  while (written < outputLength) {
    const ctrs = Buffer.from([ctr >> 24, ctr >> 16, ctr >> 8, ctr]);
    // const shaObjj = new jsSHA("SHA-256", "UINT8ARRAY", {})
    
    const shaObj = new jsSHA("SHA-256", "UINT8ARRAY", { encoding: "UTF8" });
    shaObj.update(Buffer.concat([ctrs, secret]));
    const hashResult = new Buffer(shaObj.getHash("UINT8ARRAY"));

    result = Buffer.concat([result, hashResult])
    written += 32;
    ctr += 1;
  }
  return result;
};

const convertUtf8 = (function () {
  function utf8ByteToUnicodeStr(utf8Bytes) {
    var unicodeStr = "";
    for (var pos = 0; pos < utf8Bytes.length;) {
      var flag = utf8Bytes[pos];
      var unicode = 0;
      if (flag >>> 7 === 0) {
        unicodeStr += String.fromCharCode(utf8Bytes[pos]);
        pos += 1;
      } else if ((flag & 0xfc) === 0xfc) {
        unicode = (utf8Bytes[pos] & 0x3) << 30;
        unicode |= (utf8Bytes[pos + 1] & 0x3f) << 24;
        unicode |= (utf8Bytes[pos + 2] & 0x3f) << 18;
        unicode |= (utf8Bytes[pos + 3] & 0x3f) << 12;
        unicode |= (utf8Bytes[pos + 4] & 0x3f) << 6;
        unicode |= utf8Bytes[pos + 5] & 0x3f;
        unicodeStr += String.fromCodePoint(unicode);
        pos += 6;
      } else if ((flag & 0xf8) === 0xf8) {
        unicode = (utf8Bytes[pos] & 0x7) << 24;
        unicode |= (utf8Bytes[pos + 1] & 0x3f) << 18;
        unicode |= (utf8Bytes[pos + 2] & 0x3f) << 12;
        unicode |= (utf8Bytes[pos + 3] & 0x3f) << 6;
        unicode |= utf8Bytes[pos + 4] & 0x3f;
        unicodeStr += String.fromCodePoint(unicode);
        pos += 5;
      } else if ((flag & 0xf0) === 0xf0) {
        unicode = (utf8Bytes[pos] & 0xf) << 18;
        unicode |= (utf8Bytes[pos + 1] & 0x3f) << 12;
        unicode |= (utf8Bytes[pos + 2] & 0x3f) << 6;
        unicode |= utf8Bytes[pos + 3] & 0x3f;
        unicodeStr += String.fromCodePoint(unicode);
        pos += 4;
      } else if ((flag & 0xe0) === 0xe0) {
        unicode = (utf8Bytes[pos] & 0x1f) << 12;
        unicode |= (utf8Bytes[pos + 1] & 0x3f) << 6;
        unicode |= utf8Bytes[pos + 2] & 0x3f;
        unicodeStr += String.fromCharCode(unicode);
        pos += 3;
      } else if ((flag & 0xc0) === 0xc0) {
        //110
        unicode = (utf8Bytes[pos] & 0x3f) << 6;
        unicode |= utf8Bytes[pos + 1] & 0x3f;
        unicodeStr += String.fromCharCode(unicode);
        pos += 2;
      } else {
        unicodeStr += String.fromCharCode(utf8Bytes[pos]);
        pos += 1;
      }
    }
    return unicodeStr;
  }

  function toBytes(text) {
    var result = [],
      i = 0;
    text = encodeURI(text);
    while (i < text.length) {
      var c = text.charCodeAt(i++);

      // if it is a % sign, encode the following 2 bytes as a hex value
      if (c === 37) {
        result.push(parseInt(text.substr(i, 2), 16));
        i += 2;

        // otherwise, just the actual byte
      } else {
        result.push(c);
      }
    }

    return coerceArray(result);
  }
  return {
    toBytes: toBytes,
    fromBytes: utf8ByteToUnicodeStr,
  };
})();

// AES-128-CTR is used in the Parity implementation
// Get the AES-128-CTR browser implementation
export const aesCtrEncrypt = function (counter, key, data, convertToString = true):string {
  var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
  var encryptedBytes = aesCtr.encrypt(data);

  if (!convertToString) {
    return encryptedBytes;
  }

  var encryptedText = aesjs.utils.hex.fromBytes(encryptedBytes);
  return encryptedText;
}

export const aesCtrDecrypt = function (counter, key, data) {
  var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(counter));
  var decryptedBytes = aesCtr.decrypt(data);
  var decryptedText = convertUtf8.fromBytes(decryptedBytes);
  return decryptedText;
}

function hmacSha256Sign(key, msg) {
  const shaObj = new jsSHA("SHA-256", "UINT8ARRAY", {
    hmacKey: { value: key, format: "UINT8ARRAY" },
  });
  shaObj.update(msg);
  const hmac = shaObj.getHash("UINT8ARRAY");
  return new Buffer(hmac);
}

//ECDH
const derive = function (privateKeyA, publicKeyB) {
  assert(Buffer.isBuffer(privateKeyA), "Bad input");
  assert(Buffer.isBuffer(publicKeyB), "Bad input");
  assert(privateKeyA.length === 32, "Bad private key");
  assert(publicKeyB.length === 65, "Bad public key");
  assert(publicKeyB[0] === 4, "Bad public key");
  const keyA = ec.keyFromPrivate(privateKeyA);
  const keyB = ec.keyFromPublic(publicKeyB);
  const Px = keyA.derive(keyB.getPublic());  // BN instance
  return new Buffer(Px.toArray());
};

// Encrypt AES-128-CTR and serialise as in Parity
// Serialization: <ephemPubKey><IV><CipherText><HMAC>
export const encrypt = function (publicKeyTo, msg, opts) {
  opts = opts || {};
  const ephemPrivateKey = opts.ephemPrivateKey || randomBytes(32);
  const ephemPublicKey = getPublic(ephemPrivateKey);

  const sharedPx = derive(ephemPrivateKey, publicKeyTo);
  const hash = kdf(sharedPx, 32);
  const iv = opts.iv || randomBytes(16);
  const encryptionKey = hash.slice(0, 16);

  // Generate hmac
  const shaObj = new jsSHA("SHA-256", "UINT8ARRAY", { encoding: "UTF8" });
  shaObj.update(hash.slice(16));
  const macKey = new Buffer(shaObj.getHash("UINT8ARRAY"));
  const msgBuffer = new Buffer(msg);
  const ciphertext = aesCtrEncrypt(iv, encryptionKey, msgBuffer, false);
  const dataToMac = Buffer.from([...iv, ...ciphertext]);
  const HMAC = hmacSha256Sign(macKey, dataToMac);

  return Buffer.from([...ephemPublicKey, ...iv, ...ciphertext, ...HMAC]);
};

// Decrypt serialised AES-128-CTR
export const decrypt = function (privateKey, encrypted) {
  const metaLength = 1 + 64 + 16 + 32;
  assert(encrypted.length > metaLength, "Invalid Ciphertext. Data is too small")
  assert(encrypted[0] >= 2 && encrypted[0] <= 4, "Not valid ciphertext.")

  // deserialize
  const ephemPublicKey = encrypted.slice(0, 65);
  const cipherTextLength = encrypted.length - metaLength;
  const iv = encrypted.slice(65, 65 + 16);
  const cipherAndIv = encrypted.slice(65, 65 + 16 + cipherTextLength);
  const ciphertext = cipherAndIv.slice(16);
  const msgMac = encrypted.slice(65 + 16 + cipherTextLength);

  // check HMAC
  const px = derive(privateKey, ephemPublicKey);
  const hash = kdf(px, 32);
  const encryptionKey = hash.slice(0, 16);

  const shaObj = new jsSHA("SHA-256", "UINT8ARRAY", { encoding: "UTF8" });
  shaObj.update(hash.slice(16));
  const macKey = new Buffer(shaObj.getHash("UINT8ARRAY"));

  const dataToMac = Buffer.from(cipherAndIv);
  const hmacGood = hmacSha256Sign(macKey, dataToMac);
  assert(hmacGood.equals(msgMac), "Incorrect MAC");
  const decrypted = aesCtrDecrypt(iv, encryptionKey, ciphertext);
  return decrypted;
};

export const getPublic = function (privateKey) {
  assert(privateKey.length === 32, "Bad private key");
  return new Buffer(ec.keyFromPrivate(privateKey).getPublic("arr"));
};

export const encryptShared = function (privateKeySender, publicKeyRecipient, msg, opts?) {
  opts = opts || {};
  const sharedPx = derive(privateKeySender, publicKeyRecipient)
  const sharedPrivateKey = kdf(sharedPx, 32);
  const sharedPublicKey = getPublic(sharedPrivateKey);

  return encrypt(sharedPublicKey, msg, opts);
}

export const decryptShared = function (privateKeyRecipient, publicKeySender, encrypted, opts?) {
  opts = opts || {};
  const sharedPx = derive(privateKeyRecipient, publicKeySender);
  const sharedPrivateKey = kdf(sharedPx, 32);

  return decrypt(sharedPrivateKey, encrypted, opts);
}