const jsonwebtoken = require("jsonwebtoken");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const KeyEncoder = require("key-encoder").default;
const bs58check = require("bs58check");

class JWTAuthentication {
    authenticateJWT = async (
        jwt: string,
        publicKey: string
    ) => {
        try {
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
            
            const result = jsonwebtoken.verify(jwt, rawPublicKeyEncoded, {
                algorithms: ["ES256"],
            });

            return true;
        } catch (exception) {
            return false;
        }
    }
}

export default JWTAuthentication;