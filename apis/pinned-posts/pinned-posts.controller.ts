import * as express from "express";
import asyncHandler from "express-async-handler";
import { TypeHelper } from "../../helpers/typeHelper";
import BitcloutAPI from "../../lib/bitclout/bitclout";
import JWTAuthMiddleware from "../../middleware/jwt-middleware"
import { PinnedPostsManager } from "./pinned-posts-manager";

class PinnedPostsController {
    public router = express.Router();

    private jwtAuthMiddleWare = new JWTAuthMiddleware();
    private bitclout = new BitcloutAPI();
    private pinnedPostsManager = new PinnedPostsManager();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post("/pin", this.jwtAuthMiddleWare.protected, asyncHandler(this.pinPost));
        this.router.post("/unpin", this.jwtAuthMiddleWare.protected, asyncHandler(this.unpinPost));
        this.router.get("/:publicKey", asyncHandler(this.getPinnedPost));
    }

    pinPost = async (
        request: express.Request,
        response: express.Response
    ) => {
        const { postHashHex } = request.body;
        const publicKey = request.authenticatedPublicKey;

        if (!TypeHelper.isString(publicKey) || !TypeHelper.isString(postHashHex)) {
            return response.status(400).send({ error: "Requires postHashHex and publicKey" });
        }

        try {
            const responses = await Promise.all(
                [
                    this.bitclout.isPublicKeyValid(publicKey),
                    this.bitclout.getSinglePost(postHashHex)
                ]
            );

            const publicKeyValid = responses[0];
            const post = responses[1];
            const postValid = !!post?.PostFound;

            if (!publicKeyValid) {
                return response.status(400).send({ success: false, error: "publicKey does not exist" });
            }

            if (!postValid) {
                return response.status(400).send({ success: false, error: "postHashhex does not exist" });
            }

            await this.pinnedPostsManager.pinPost(publicKey as string, postHashHex);
            return response.send({ success: true });
        } catch (exception) {
            return response.status(400).send({ success: false, error: "Error pinning post" });
        }
    };

    unpinPost = async (
        request: express.Request,
        response: express.Response
    ) => {
        const { postHashHex } = request.body;
        const publicKey = request.authenticatedPublicKey

        if (!TypeHelper.isString(publicKey) || !TypeHelper.isString(postHashHex)) {
            return response.status(400).send({ error: "Requires postHashHex and publicKey" });
        }

        try {
            const deletedCount = await this.pinnedPostsManager.unpinPost(publicKey as string, postHashHex);
            return response.send({ success: true, deletedCount });
        } catch {
            return response.status(400).send({ success: false, error: "Error deleting pinned post" });
        }
    };

    getPinnedPost = async (
        request: express.Request,
        response: express.Response
    ) => {
        const { publicKey } = request.params;

        if (!TypeHelper.isString(publicKey)) {
            return response.status(400).send({ error: "public key is not valid" });
        }

        try {
            const result = await this.pinnedPostsManager.getPinnedPost(publicKey);
            return response.send(result);
        } catch {
            return response.status(400).send({ success: false, error: "Error fetching post" });
        }
    };
}

export default PinnedPostsController;
