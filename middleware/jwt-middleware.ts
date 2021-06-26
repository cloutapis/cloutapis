import * as express from "express";
import JWTAuthentication from "../lib/jwt-authentication";

declare global {
    namespace Express {
        export interface Request {
            // The publicKey that was used to validate the presented JWT
            // Ensure that authenticated operations are only performed for this publicKey
            authenticatedPublicKey?: string
        }
    }
}

class JWTAuthMiddleware {
    private jwtAuthenticator = new JWTAuthentication()

    public protected = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const { jwt: getJWT, publicKey: getPublicKey } = request.query;
        const { jwt: postJWT, publicKey: postPublicKey } = request.body;
        const { publicKey: paramsPublicKey } = request.params;

        const jwt = getJWT || postJWT;
        // Order matters here - if there is a paramsPublicKey we must check
        // that since it's the key that the route will operate on
        const publicKey = paramsPublicKey || getPublicKey || postPublicKey;

        if (!jwt || !publicKey) {
            response.status(403).send({ validJWT: false, error: "Requires jwt & publicKey"});
            return
        }
        const isValidJWT = await this.jwtAuthenticator.authenticateJWT(jwt, publicKey);
        if (isValidJWT) {
            request.authenticatedPublicKey = publicKey;
            next()
        }
        else {
            response.status(403).send({ validJWT: false, error: "Invalid or expired jwt"});
        }
    }
}

export default JWTAuthMiddleware;