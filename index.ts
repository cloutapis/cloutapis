import express from "express";
import path from "path";
import CloutTagsController from "./apis/clouttags/clouttags.controller";
import SavedPostsController from "./apis/saved-posts/saved-posts.controller";
import PinnedPostsController from "./apis/pinned-posts/pinned-posts.controller";
import AuthorizationController from "./apis/authorization/authorization.controller";
import RandomizeController from "./apis/randomize/randomize.controller"

const PORT = process.env.PORT || 5000;
const server = express();

express()
  .use(express.static(path.join(__dirname, "../public")))
  .use(express.json())
  .use("/", new CloutTagsController().router)
  .use("/saved-posts/", new SavedPostsController().router)
  .use("/pinned-posts/", new PinnedPostsController().router)
  .use("/authorization/", new AuthorizationController().router)
  .use("/randomize/", new RandomizeController().router)
  .get("/", (req, res) => res.redirect(301, "https://www.cloutapis.com"))
  .use(function errorHandler(err, req, res, next) {
    console.error(`${err.message} - ${err.stack}`);

    res.status(500).json({
      status: 500,
      error: "Something went wrong",
    });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
