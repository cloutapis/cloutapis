import express from "express";
import path from "path";
import CloutTagsController from "./apis/clouttags/clouttags.controller";
import SearchController from "./apis/search/search.controller";

const PORT = process.env.PORT || 5000;
const server = express();

express()
  .use(express.static(path.join(__dirname, "../public")))
  .use("/", new CloutTagsController().router)
  .use("/", new SearchController().router)
  .set("views", path.join(__dirname, "../views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .use(function errorHandler(err, req, res, next) {
    console.error(`${err.message} - ${err.stack}`);

    res.status(500).json({
      status: 500,
      data: "Something went wrong",
    });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
