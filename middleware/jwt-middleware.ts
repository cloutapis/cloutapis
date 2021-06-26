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
        let publicKey = getPublicKey || postPublicKey;

        // Look for a publicKey to verify in
        // the path if we have a JWT but no publicKey
        if (jwt && !publicKey) {
            publicKey = request.path.match(/[-A-Za-z0-9.]{55,56}$/)?.shift();
        }

        if (!jwt || !publicKey) {
            response.status(403).send({ validJWT: false, error: "Requires jwt & publicKey"});
            return
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