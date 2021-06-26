import * as express from "express";
import asyncHandler from "express-async-handler";
import { AuthorizationManager } from "./authorization-manager";

class AuthorizationController {
    private authorizationManager = new AuthorizationManager();
    public path = "/authorization";
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post("/authorization/validateToken", asyncHandler(this.validateToken));
    }

    validateToken = async (
        request: express.Request,
        response: express.Response
    ) => {
        const { publicKey, token }: { publicKey: string; token: string; } = request.body;

        if (!publicKey || !token) {
            response.status(401).send('Request body is not valid');
            return;
        }

        const result = this.authorizationManager.validateJWTToken(publicKey, token);

        if (result.valid) {
            response.send(result);
        } else {
            response.status(401).send(result);
        }
    };
}

export default AuthorizationController;
