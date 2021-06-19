import db from "../../../models/index"

const fetch = require("node-fetch");

export class PostParser {

    public fetchAndSaveLatestTaggedPosts = async () => {
        const latestTaggedPosts = await this.getLatestTaggedPosts()
        for (const taggedPost of latestTaggedPosts) {
            await db.TagPost.create(taggedPost)
        }
        return latestTaggedPosts
    }

    private getLatestTaggedPosts = async () => {
        const mappings: any = [];
        const response = await this.getLatestPosts()
        response?.PostsFound.forEach(function (post: any) {
            const hashtags = post.Body.match(/\#[a-zA-Z]+[a-zA-Z0-9]+/);

            if (!!hashtags) {
                hashtags.forEach(function (hashtag: any) {
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

    private getLatestPosts = async () => {
        const route = "https://bitclout.com/api/v0/get-posts-stateless";
        const requestBody = {
            PostHashHex: '',
            ReaderPublicKeyBase58Check: '',
            OrderBy: '',
            StartTstampSecs: null,
            PostContent: '',
            NumToFetch: 10,
            FetchSubcomments: false,
            GetPostsForFollowFeed: false,
            GetPostsForGlobalWhitelist: false,
            AddGlobalFeedBool: false
        };

        const headers = {
            'content-type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15'
        };

        const response = await fetch(
            route,
            {
                headers,
                method: 'POST',
                body: JSON.stringify(requestBody)
            }
        );

        if (response.ok) {
            return await response.json();
        } else {
            return undefined;
        }
    }
}

export default PostParser