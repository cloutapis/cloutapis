import express from "express";
import path from "path";
import CloutTagsController from "./apis/clouttags/clouttags.controller";
import SearchController from "./apis/search/search.controller";
import AuthorizationController from "./apis/authorization/authorization.controller";

const PORT = process.env.PORT || 5000;
const server = express();

express()
  .use(express.static(path.join(__dirname, "../public")))
  .use(express.json())
  .use("/", new CloutTagsController().router)
  .use("/", new SearchController().router)
  .use("/", new AuthorizationController().router)
  .get("/", (req, res) => res.redirect(301, "https://www.cloutapis.com"))
  .use(function errorHandler(err, req, res, next) {
    console.error(`${err.message} - ${err.stack}`);

    res.status(500).json({
      status: 500,
      error: "Something went wrong",
    });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
