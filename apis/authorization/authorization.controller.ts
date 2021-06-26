import * as express from "express";
import asyncHandler from "express-async-handler";
import JWTAuthMiddleware from "../../middleware/jwt-middleware"

class AuthorizationController {
    private jwtAuthMiddleWare = new JWTAuthMiddleware();
    public path = "/authorization";
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post("/authorization/validate-token/:publicKey", this.jwtAuthMiddleWare.protected, asyncHandler(this.validateToken));
    }

    validateToken = async (
        request: express.Request,
        response: express.Response
    ) => {
        // Protected by Middleware
        response.send({ validJWT: true })
    };
}

export default AuthorizationController;
