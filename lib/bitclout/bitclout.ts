const fetch = require("node-fetch"); 

export class BitcloutAPI {
    public getLatestPosts = async () => {
        const route = "https://bitclout.com/api/v0/get-posts-stateless";
        const requestBody = {
            PostHashHex: '',
            ReaderPublicKeyBase58Check: '',
            OrderBy: '',
            StartTstampSecs: null,
            PostContent: '',
            NumToFetch: 100,
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

export default BitcloutAPI