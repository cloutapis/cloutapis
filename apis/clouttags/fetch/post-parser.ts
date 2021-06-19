import sampleResponse from "../../../sample/posts-response.json";
import db from "../../../models/index"

class PostParser {

    fetchAndSaveLatestTaggedPosts = async () => {
        const latestTaggedPosts = await this.getLatestTaggedPosts() 
        for (const taggedPost of latestTaggedPosts) {
            await db.TagPost.create(taggedPost)
        }
        return latestTaggedPosts
    }

    getLatestTaggedPosts = async () => {
        const mappings: any = [];
        const response = await this.getLatestPosts()
        response.PostsFound.forEach(function(post: any) {
            const hashtags = post.Body.match(/\#[a-zA-Z]+[a-zA-Z0-9]+/);

            if (!!hashtags) {
                hashtags.forEach(function(hashtag: any) {
                    const mapping = {
                        postHashHex: post.PostHashHex,
                        tag: hashtag.replace("#", ""),
                        postObject: JSON.stringify(post)
                    }
                    mappings.push(mapping);
                })
            }
        })
        return mappings;
    }

    getLatestPosts = async () => {
        // Return sample posts from JSON for now
        // This should be an API call
        return sampleResponse;
    }
}

export default PostParser