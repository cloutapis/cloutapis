import * as express from 'express';
import CloutTag from './clouttag.interface';
import Post from './post.interface';
 
class CloutTagsController {
  public path = '/clouttags';
  public router = express.Router();
 
  private tags: CloutTag[] = [
    {
      tag: "Derp"
    }
  ];

  private posts: Post[] = [
    {
      transactionHashHex: "1",
      clouttags: [ {
        tag: "Derp"
      }]
    }
  ];
 
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get('/clouttags/trending', this.getTopTags);
    this.router.get('/clouttags/search', this.searchTags);

    this.router.get('/clouttag/:tag', this.getTag)
    this.router.get('/clouttag/:tag/posts', this.getTagPosts);
  }
 
  getTopTags = (request: express.Request, response: express.Response) => {
    response.send(this.tags);
  }

  searchTags = (request: express.Request, response: express.Response) => {
    response.send(this.tags);
  }

  getTag = (request: express.Request, response: express.Response) => {
    let { tag } = request.params;
    if (!tag) {
      response.status(400).send({
        error: "Requires :tag"
      })
    }

    response.send(this.tags[0])
  }

  getTagPosts = (request: express.Request, response: express.Response) => {
    let { tag } = request.params;
    let { afterTransactionHashHex } = request.query;
    if (!tag) {
      response.status(400).send({
        error: "Requires :tag"
      })
    }

    response.send(this.posts[0])
  }
 
  createAPost = (request: express.Request, response: express.Response) => {
    const { post }: { post: CloutTag } = request.body;
    this.tags.push(post);
    response.send(post);
  }
}
 
export default CloutTagsController;