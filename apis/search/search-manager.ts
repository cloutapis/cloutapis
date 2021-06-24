import elasticsearch from "elasticsearch";

export class SearchManager {
  private client = new elasticsearch.Client({
    host: process.env.BONSAI_URL,
    log: "error",
  });

  public indexPosts = async (posts) => {
    var self = this;
    var bulkRequests: any[] = [];
    posts?.PostsFound.forEach(function (post: any) {
      const requestHeader = {
        index: {
          _index: "post-index",
          _id: post.PostHashHex,
        },
      };
      bulkRequests.push(requestHeader);

      const request = {
        id: post.PostHashHex,
        index: "post-index",
        body: {
          post: post.Body,
          author: post.ProfileEntryResponse?.Username,
          likes: post.LikeCount,
          comments: post.CommentCount,
          reclouts: post.RecloutCount,
          diamonds: post.DiamondCount,
        },
      };
      bulkRequests.push(request);
    });
    self.client.bulk({ body: bulkRequests });
  };

  public performSearch = async (term) => {
    const results = await this.client.search({
      index: "post-index",
      size: 10,
      body: {
        query: {
          multi_match: {
            query: term,
            fuzziness: "AUTO",
            fields: ["*"],
          },
        },
      },
    });
    return results?.hits?.hits?.map(function (hit) {
      return hit._id;
    });
  };

  public healthCheck = async () => {
    this.client.ping(
      {
        requestTimeout: 30000,
      },
      function (error) {
        if (error) {
          console.error("elasticsearch cluster is down!");
        } else {
          console.log("All is well");
        }
      }
    );
  };
}

export default SearchManager;
