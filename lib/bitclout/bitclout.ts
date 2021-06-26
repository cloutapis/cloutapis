const fetch = require("node-fetch");

export class BitcloutAPI {

    private readonly _baseUrl = "https://bitclout.com/api/";
    private readonly _headers = {
        'content-type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15'
    };

    public getLatestPosts = async () => {
        const method = "v0/get-posts-stateless";
        const body = {
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

        const response = await this.post(method, body);

        if (response.ok) {
            return await response.json();
        } else {
            return undefined;
        }
    }

    public isPublicKeyValid = async (publicKey: string) => {
        const profile = await this.getSingleProfile(publicKey);
        return !!profile?.Profile;
    }

    public getSingleProfile = async (publicKey: string) => {
        const method = "v0/get-single-profile";
        const body = {
            PublicKeyBase58Check: publicKey,
            username: ''
        };

        const response = await this.post(method, body);

        if (response.ok) {
            return await response.json();
        } else {
            return undefined;
        }
    }

    public getSinglePost = async (postHashHex: string) => {
        const method = "v0/get-single-post";
        const body = {
            PostHashHex: postHashHex,
            ReaderPublicKeyBase58Check: "",
            FetchParents: false,
            CommentOffset: 0,
            CommentLimit: 0,
            AddGlobalFeedBool: false
        };

        const response = await this.post(method, body);

        if (response.ok) {
            return await response.json();
        } else {
            return undefined;
        }
    }

    private post = async (method: string, body: object) => {
        const route = this._baseUrl + method;
        return fetch(
            route,

            {
                headers: this._headers,
                method: 'POST',
                body: JSON.stringify(body)
            }
        );
    }
}

export default BitcloutAPI