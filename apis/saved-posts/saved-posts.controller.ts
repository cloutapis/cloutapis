import * as express from "express";
import db from "../../models/index";
import asyncHandler from "express-async-handler";
import { TypeHelper } from "../../helpers/typeHelper";
import BitcloutAPI from "../../lib/bitclout/bitclout";
import JWTAuthMiddleware from "../../middleware/jwt-middleware"

class SavedPostsController {
    public router = express.Router();
    private jwtAuthMiddleWare = new JWTAuthMiddleware();
    private _bitclout = new BitcloutAPI();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post("/saved-posts/save", this.jwtAuthMiddleWare.protected, asyncHandler(this.savePost));
        this.router.post("/saved-posts/unsave", this.jwtAuthMiddleWare.protected, asyncHandler(this.unsavePost));
        this.router.get("/saved-posts/:publicKey", this.jwtAuthMiddleWare.protected, asyncHandler(this.getSavedPosts));
    }

    savePost = async (
        request: express.Request,
        response: express.Response
    ) => {
        const { postHashHex } = request.body;
        const publicKey = request.authenticatedPublicKey

        if (!TypeHelper.isString(publicKey) || !TypeHelper.isString(postHashHex)) {
            return response.status(400).send({ error: "Requires postHashHex and publicKey" });
        }

        try {
            const responses = await Promise.all(
                [
                    this._bitclout.isPublicKeyValid(publicKey),
                    this._bitclout.getSinglePost(postHashHex)
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

            const dbObject = {
                publicKey,
                postHashHex,
                postedAt: new Date(post.PostFound.TimestampNanos / 1000000)
            };

            await db.SavedPosts.create(dbObject);
            return response.send({ success: true });
        } catch {
            return response.status(400).send({ success: false, error: "Error saving post" });
        }
    };

    unsavePost = async (
        request: express.Request,
        response: express.Response
    ) => {
        const { postHashHex } = request.body;
        const publicKey = request.authenticatedPublicKey

        if (!TypeHelper.isString(publicKey) || !TypeHelper.isString(postHashHex)) {
            return response.status(400).send({ error: "Requires postHashHex and publicKey" });
        }

        try {
            const result = await db.SavedPosts.destroy(
                {
                    where: {
                        publicKey,
                        postHashHex
                    }
                }
            );
            return response.send({ success: true, deletedCount: result });
        } catch {
            return response.status(400).send({ success: false, error: "Error deleting saved post" });
        }
    };

    getSavedPosts = async (
        request: express.Request,
        response: express.Response
    ) => {
        const publicKey = request.authenticatedPublicKey
        const { numToFetch, offset } = request.query;

        if (!TypeHelper.isString(publicKey)) {
            response.status(400).send({ error: "public key is not valid" });
        }

        let numToFetchNum = Number(numToFetch);
        if (!TypeHelper.isNumber(numToFetchNum)) {
          numToFetchNum = 20;
        }
    
        let offsetNum = Number(offset);
        if (!TypeHelper.isNumber(offsetNum)) {
          offsetNum = 0;
        }
    
        try {
            const result = await db.SavedPosts.findAll(
                {
                    limit: numToFetchNum,
                    offset: offsetNum,
                    where: {
                        publicKey
                    },
                    order: [["postedAt", "DESC"]],
                }
            ).then((posts) => posts.map((post) => post.postHashHex));
            return response.send(result);
        } catch {
            return response.status(400).send({ success: false, error: "Error fetching posts" });
        }
    };
}

export default SavedPostsController;
