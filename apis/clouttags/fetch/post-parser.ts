import db from "../../../models/index"

const fetch = require("node-fetch");

export class PostParser {

    public fetchAndSaveLatestTaggedPosts = async () => {
        const latestTaggedPosts = await this.getLatestTaggedPosts()
        for (const taggedPost of latestTaggedPosts) {
            try {
                await db.TagPost.create(taggedPost)
            }
            catch (e) {
                console.log(`Couldn't save TagPost: ${e}`)
            }
        }
        return latestTaggedPosts
    }

    private getLatestTaggedPosts = async () => {
        const mappings: any = [];
        const response = await this.getLatestPosts()
        response?.PostsFound.forEach(function (post: any) {
            const hashtags = post.Body.match(/\#(?:\w|[_]|[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+/g);

            if (!!hashtags) {
                hashtags.forEach(function (hashtag: any) {
                    const mapping = {
                        postHashHex: post.PostHashHex,
                        clouttag: hashtag.replace("#", "")
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
            NumToFetch: 50,
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