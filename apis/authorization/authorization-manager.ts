const jsonwebtoken = require("jsonwebtoken");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const KeyEncoder = require("key-encoder").default;
const bs58check = require("bs58check");

export class AuthorizationManager {

    public validateJWTToken = (publicKey: string, jwt: string) => {
        const publicKeyDecoded = bs58check.decode(publicKey);
        const publicKeyDecodedArray = [...publicKeyDecoded];
        const rawPublicKeyArray = publicKeyDecodedArray.slice(3);

        const rawPublicKeyHex = ec
            .keyFromPublic(rawPublicKeyArray, "hex")
            .getPublic()
            .encode("hex", true);

        const keyEncoder = new KeyEncoder("secp256k1");
        const rawPublicKeyEncoded = keyEncoder.encodePublic(
            rawPublicKeyHex,
            "raw",
            "pem"
        );

        try {
            const result = jsonwebtoken.verify(jwt, rawPublicKeyEncoded, {
                algorithms: ["ES256"],
            });

            return { valid: true, result };
        } catch (exception) {
            return { valid: false, result: exception };
        }
    }
}
