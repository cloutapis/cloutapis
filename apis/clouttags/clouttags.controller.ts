import * as express from "express";
import db, { sequelize } from "../../models/index";
import { Op } from "sequelize";
import moment from "moment";
import { TypeHelper } from "../../helpers/typeHelper";
import asyncHandler from "express-async-handler";

class CloutTagsController {
  public path = "/clouttags";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get("/clouttags/trending", asyncHandler(this.getTopTags));
    this.router.get("/clouttags/search/:tag", asyncHandler(this.searchTags));

    this.router.get("/clouttag/:tag", asyncHandler(this.getTag));
    this.router.get("/clouttag/:tag/posts", asyncHandler(this.getTagPosts));
  }

  getTopTags = async (request: express.Request, response: express.Response) => {
    const { numToFetch, offset } = request.query;

    let numToFetchNum = Number(numToFetch);
    if (!TypeHelper.isNumber(numToFetchNum)) {
      numToFetchNum = 20;
    }

    let offsetNum = Number(offset);
    if (!TypeHelper.isNumber(offsetNum)) {
      offsetNum = 0;
    }

    const tags = await db.TagPost.findAll({
      limit: numToFetchNum,
      offset: offsetNum,
      where: {
        createdAt: {
          [Op.gte]: moment().subtract(1, "days").toDate(),
        },
      },
      attributes: [
        "clouttag",
        [sequelize.literal('COUNT(DISTINCT(COALESCE("userPublicKeyBase58", "postHashHex")))'), 'count']
      ],
      group: ["clouttag"],
      order: [[sequelize.col("count"), "DESC"]],
      raw: true,
    });

    const formatted = tags.map(function (tag) {
      tag.count = parseInt(tag.count);
      return tag;
    });

    response.send(formatted);
  };

  searchTags = async (request: express.Request, response: express.Response) => {
    let { tag } = request.params;

    if (!tag) {
      response.status(400).send({
        error: "Requires :tag",
      });
    }

    const tagLowercase = tag.toLocaleLowerCase();

    const tags = await db.TagPost.findAll({
      limit: 20,
      where: {
        clouttag: {
          [Op.like]: tagLowercase + "%",
        },
      },
      attributes: [
        "clouttag", 
        [sequelize.literal('COUNT(DISTINCT(COALESCE("userPublicKeyBase58", "postHashHex")))'), 'count']
      ],
      group: ["clouttag"],
      order: [[sequelize.col("count"), "DESC"]],
      raw: true,
    });

    const formatted = tags.map(function (tag) {
      tag.count = parseInt(tag.count);
      return tag;
    });

    response.send(formatted);
  };

  getTag = (request: express.Request, response: express.Response) => {
    let { tag } = request.params;
    if (!tag) {
      response.status(400).send({
        error: "Requires :tag",
      });
    }

    response.send([]);
  };

  getTagPosts = async (
    request: express.Request,
    response: express.Response
  ) => {
    const { tag } = request.params;
    const { numToFetch, offset } = request.query;

    if (!tag) {
      response.status(400).send({
        error: "Requires :tag",
      });
    }

    let numToFetchNum = Number(numToFetch);
    if (!TypeHelper.isNumber(numToFetchNum)) {
      numToFetchNum = 20;
    }

    let offsetNum = Number(offset);
    if (!TypeHelper.isNumber(offsetNum)) {
      offsetNum = 0;
    }

    const tagLowercase = tag.toLocaleLowerCase();
    const posts = await db.TagPost.findAll({
      limit: numToFetchNum,
      offset: offsetNum,
      where: {
        clouttag: tagLowercase,
      },
      attributes: ["postHashHex"],
      order: [["postedAt", "DESC"]],
    }).then((posts) => posts.map((post) => post.postHashHex));

    response.send(posts);
  };
}

export default CloutTagsController;
