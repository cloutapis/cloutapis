import { crypto } from "./crypto.js";
import { SecureStoreAuthenticatedUserEncryptionKey, SecureStoreAuthenticatedUser } from './types';
import KeyEncoder from "key-encoder";
import sha256 from './sha256.js';

// const sha256 = require("sha256");
import * as ecies from './ecies.js';
// const ecies = require("./ecies.js");

// var rs = require("jsrsasign");
import * as rs from 'jsrsasign';
var JWS = rs.jws.JWS;

var header = { alg: "ES256", typ: "JWT" };

async function getSeedHex(): Promise<string> {
    const { BITCLOUT_SEED } = process.env;
    const mnemo = BITCLOUT_SEED;
    if (mnemo == null) {
        return "";
    }
    let seedHex = crypto.mnemonicToSeedHex(mnemo);
    return seedHex;
}

const signJWT = async (): Promise<string> => {
    const seedHex = await getSeedHex();
    const keyEncoder = new KeyEncoder("secp256k1");
    const encodedPrivateKey = keyEncoder.encodePrivate(seedHex, "raw", "pem");

    const expDate = new Date();
    expDate.setSeconds(expDate.getSeconds() + 60);

    var signedJWT = JWS.sign(
        header.alg,
        JSON.stringify(header),
        JSON.stringify({ exp: Math.floor(expDate.getTime() / 1000) }),
        encodedPrivateKey
    );

    return signedJWT;
};

const signTransaction = async (transactionHex: string): Promise<string> => {
    const seedHex = await getSeedHex();

    const privateKey = crypto.seedHexToPrivateKey(seedHex);

    const transactionBytes = new Buffer(transactionHex, 'hex');
    const txHash1 = Buffer.from(sha256(transactionBytes), 'hex');
    const txHash2 = sha256(txHash1);
    const transactionHash = Buffer.from(txHash2, 'hex');
    const signature = privateKey.sign(transactionHash);
    const signatureBytes = new Buffer(signature.toDER());
    const signatureLength = crypto.uintToBuf(signatureBytes.length);

    const signedTransactionBytes = Buffer.concat(
        [
            transactionBytes.slice(0, -1),
            signatureLength,
            signatureBytes,
        ]
    );

    return signedTransactionBytes.toString("hex");
};

const decryptData = async (encryptedHex: string): Promise<string> => {
    const seedHex = await getSeedHex();

    const privateKey = crypto.seedHexToPrivateKey(seedHex);
    const privateKeyBuffer = privateKey.getPrivate().toArrayLike(Buffer);
    const encryptedBytes = new Buffer(encryptedHex, 'hex');

    const decryptedHex = ecies.decrypt(
        privateKeyBuffer,
        encryptedBytes
    );

    return decryptedHex;
}

const encryptShared = async (publicKey: string, data: string): Promise<string> => {
    const seedHex = await getSeedHex();

    const privateKey = crypto.seedHexToPrivateKey(seedHex);
    const privateKeyBuffer = privateKey.getPrivate().toArrayLike(Buffer);
    const publicKeyBytes = crypto.publicKeyToECBuffer(publicKey);

    const encryptedHex = ecies.encryptShared(
        privateKeyBuffer,
        publicKeyBytes,
        data
    );

    return encryptedHex.toString('hex');
}

const decryptShared = async (publicKey: string, encryptedHex: string): Promise<string> => {
    const seedHex = await getSeedHex();

    const privateKey = crypto.seedHexToPrivateKey(seedHex);
    const privateKeyBuffer = privateKey.getPrivate().toArrayLike(Buffer);
    const encryptedBytes = new Buffer(encryptedHex, 'hex');
    const publicKeyBytes = crypto.publicKeyToECBuffer(publicKey);

    const decryptedHex = ecies.decryptShared(
        privateKeyBuffer,
        publicKeyBytes,
        encryptedBytes
    );

    return decryptedHex;
}

export const signing = {
    signTransaction,
    decryptData,
    signJWT,
    encryptShared,
    decryptShared
};
