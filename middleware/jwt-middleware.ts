import * as express from "express";
import JWTAuthentication from "../lib/jwt-authentication";

class JWTAuthMiddleware {
    private jwtAuthenticator = new JWTAuthentication()

    public protected = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const { jwt: getJWT, publicKey: getPublicKey } = request.query;
        const { jwt: postJWT, publicKey: postPublicKey } = request.body;
        const jwt = getJWT || postJWT;
        const publicKey = getPublicKey || postPublicKey;

        if (!jwt || !publicKey) {
            response.status(403).send({ validJWT: false, error: "Requires jwt & publicKey"});
        }
        const isValidJWT = await this.jwtAuthenticator.authenticateJWT(jwt, publicKey);
        if (isValidJWT) {
            next()
        }
        else {
            response.status(403).send({ validJWT: false, error: "Invalid or expired jwt"});
        }
    }
}

export default JWTAuthMiddleware;