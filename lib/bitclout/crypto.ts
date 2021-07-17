// import * as EL from 'elliptic';
// const EC = EL.ec;

import elliptic from 'elliptic';

const { ec } = elliptic;


import HDKey from 'hdkey';
import bip39 from 'bip39';
import bs58check from 'bs58check';


// global.Buffer = global.Buffer || require('buffer').Buffer

function seedHexToPrivateKey(seedHex: string) {
    const ec2 = new ec('secp256k1');
    return ec2.keyFromPrivate(seedHex);
}

function uintToBuf(uint: number) {
    const result = [] as any;

    while (uint >= 0x80) {
        result.push((uint & 0xff) | 0x80);
        uint >>>= 7;
    }

    result.push(uint | 0);

    return new Buffer(result);
}

function isValidMnemonic(mnemonic: string): boolean {
    try {
        bip39.mnemonicToEntropy(mnemonic);
    } catch {
        return false;
    }
    return true;
}

function keychainToSeedHex(keychain: any) {
    return keychain.privateKey.toString('hex');
}

function mnemonicToKeychain(mnemonic: string, extraText?: string, nonStandard?: boolean) {
    const seed = bip39.mnemonicToSeedSync(mnemonic, extraText);
    return HDKey.fromMasterSeed(seed).derive("m/44'/0'/0'/0/0", nonStandard);
}

function privateKeyToBitCloutPublicKey(privateKey: any) {
    const prefix = [0xcd, 0x14, 0x0];
    const key = privateKey.getPublic().encode('array', true);
    const prefixAndKey = Uint8Array.from([...prefix, ...key]);

    return bs58check.encode(prefixAndKey);
}

function mnemonicToSeedHex(seedPhrase: string, extraText?: string, nonStandard?: boolean) {
    const keychain = mnemonicToKeychain(seedPhrase, extraText, nonStandard);
    const seedHex = keychainToSeedHex(keychain);

    return seedHex;
}

function publicKeyToECBuffer(publicKey: string): Buffer {
    const decoded = bs58check.decode(publicKey);
    const payload = Uint8Array.from(decoded).slice(3);
    const eec = new ec('secp256k1');
    const publicKeyEC = eec.keyFromPublic(payload, 'array');

    return new Buffer(publicKeyEC.getPublic('array'));
}

// const ecies = require("./ecies");
import * as ecies from './ecies.js'

export const crypto = {
    isValidMnemonic,
    mnemonicToKeychain,
    keychainToSeedHex,
    seedHexToPrivateKey,
    uintToBuf,
    privateKeyToBitCloutPublicKey,
    mnemonicToSeedHex,
    aesEncrypt: (counter: Buffer, key: Buffer, data: Buffer): string => ecies.aesCtrEncrypt(counter, key, data),
    aesDecrypt: (counter: Buffer, key: Buffer, data: Buffer): string => ecies.aesCtrDecrypt(counter, key, data),
    publicKeyToECBuffer
};