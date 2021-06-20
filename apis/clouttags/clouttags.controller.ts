import * as express from 'express';
import CloutTag from './clouttag.interface';
import Post from './post.interface';
import db, { sequelize } from "../../models/index";
import { Op } from "sequelize";
import moment from 'moment'

class CloutTagsController {
  public path = '/clouttags';
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get('/clouttags/trending', this.getTopTags);
    this.router.get('/clouttags/search/:tag', this.searchTags);

    this.router.get('/clouttag/:tag', this.getTag)
    this.router.get('/clouttag/:tag/posts', this.getTagPosts);
  }

  getTopTags = async (request: express.Request, response: express.Response) => {
    const tags = await db.TagPost.findAll({
      limit: 20,
      where: {
        createdAt: {
          [Op.gte]: moment().subtract(1, 'days').toDate()
        }
      },
      attributes: ["clouttag", [sequelize.fn("COUNT", "0"), "count"]],
      group: ["clouttag"],
      order: [[sequelize.col("count"), "DESC"]],
      raw: true
    });

    const formatted = tags.map(function (tag) {
        tag.count = parseInt(tag.count);
        return tag;
    });

    response.send(formatted);
  }

  searchTags = async (request: express.Request, response: express.Response) => {
    let { tag } = request.params;
    if (!tag) {
      response.status(400).send({
        error: "Requires :tag"
      })
    }

    const tagLowercase = tag.toLocaleLowerCase();

    const tags = await db.TagPost.findAll({
      limit: 20,
      where: {
        clouttag: {
          [Op.like]: tagLowercase + "%"
        }
      },
      attributes: ["clouttag", [sequelize.fn("COUNT", "0"), "count"]],
      group: ["clouttag"],
      order: [[sequelize.col("count"), "DESC"]],
      raw: true
    });

    const formatted = tags.map(function (tag) {
      tag.count = parseInt(tag.count);
      return tag;
    });

    response.send(formatted)
  }

  getTag = (request: express.Request, response: express.Response) => {
    let { tag } = request.params;
    if (!tag) {
      response.status(400).send({
        error: "Requires :tag"
      })
    }

    response.send([])
  }

  getTagPosts = async (request: express.Request, response: express.Response) => {
    const { tag } = request.params;
    const { numToFetch, offset } = request.query;

    if (!tag) {
      response.status(400).send({
        error: "Requires :tag"
      });
    }

    const isNumber = (value) => value != null && !isNaN(value) && !isNaN(parseFloat(value));

    let numToFetchNum = Number(numToFetch);
    if (!isNumber(numToFetchNum)) {
      numToFetchNum = 20;
    }

    let offsetNum = Number(offset);
    if (!isNumber(offsetNum)) {
      offsetNum = 0;
    }

    const tagLowercase = tag.toLocaleLowerCase();
    const posts = await db.TagPost.findAll({
      limit: numToFetchNum,
      offset: offsetNum,
      where: {
        clouttag: tagLowercase
      },
      attributes: ["postHashHex"],
      order: [["postedAt", "DESC"]]
    }).then(posts => posts.map(post => post.postHashHex));;

    response.send(posts);
  }
}

export default CloutTagsController;