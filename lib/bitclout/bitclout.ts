const fetch = require("node-fetch");
import {signing} from './signing.js';

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

    public getNotifications = async (publicKeyBase58: String) => {
        const method = "v0/get-notifications";
        const body = {
            PublicKeyBase58Check: publicKeyBase58,
            FetchStartIndex: -1,
            NumToFetch: 50
        };

        const response = await this.post(method, body);

        if (response.ok) {
            return await response.json();
        } else {
            return undefined;
        }
    }

    public isPublicKeyValid = async (publicKey?: string) => {
        if (!publicKey) {
            return false;
        }
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

    public getSinglePost = async (postHashHex: string, commentLimit: number = 0) => {
        const method = "v0/get-single-post";
        const body = {
            PostHashHex: postHashHex,
            ReaderPublicKeyBase58Check: "",
            FetchParents: false,
            CommentOffset: 0,
            CommentLimit: commentLimit,
            AddGlobalFeedBool: false
        };

        const response = await this.post(method, body);

        if (response.ok) {
            return await response.json();
        } else {
            return undefined;
        }
    }

    public getRecloutersForPost = async (postHashHex: string, limit: number = 1000) => {
        console.log(`Fetching reclouters for post: ${postHashHex}`);
        const method = "v0/get-reclouts-for-post";
        const body = {
            PostHashHex: postHashHex,
            Offset: 0,
            Limit: limit,
            ReaderPublicKeyBase58Check: ""
        };

        const response = await this.post(method, body);

        if (response.ok) {
            let json = await response.json();
            console.log(JSON.stringify(json));
            let reclouters = json?.Reclouters;
            console.log(`Got reclouters: ${JSON.stringify(reclouters)}`);
            return reclouters ?? [];
        } else {
            console.error(`Fetch reclouters response code: ${response.status}`);
            return [];
        }
    }

    public getQuoteRecloutersForPost = async (postHashHex: string, limit: number = 1000) => {
        console.log(`Fetching quote reclouters for post: ${postHashHex}`);
        const method = "v0/get-reclouts-for-post";
        const body = {
            PostHashHex: postHashHex,
            Offset: 0,
            Limit: limit,
            ReaderPublicKeyBase58Check: ""
        };

        const response = await this.post(method, body);

        if (response.ok) {
            let quoteReclouters = (await response.json())?.QuoteReclouts?.map(function (reclout) {
                return reclout.ProfileEntryResponse;
            });
            console.log(`Got quote reclouters: ${JSON.stringify(quoteReclouters)}`);
            return quoteReclouters ?? [];
        } else {
            return [];
        }
    }

    public createPost = async (message: String, inReplyToPost: string) => {
        const method = "v0/submit-post";
        const body = {
            UpdaterPublicKeyBase58Check: "BC1YLgonSFPGDNE67EY6LytqHqvkYZYGHz3wECuCCLwYqorwhLv4VJG", // @randomize
            PostHashHexToModify: "",
            ParentStakeID: inReplyToPost ?? "",
            Title: "",
            BodyObj: {
                Body: message,
                ImageURLs: []
            },
            RecloutedPostHashHex: "",
            Sub: "",
            CreatorBasisPoints: 0,
            StakeMultipleBasisPoints: 12500,
            IsHidden: false,
            MinFeeRateNanosPerKB: 1000
        };

        const response = await this.post(method, body);
        const transactionHashHex = (await response.json())?.TransactionHex;
        const signed = await signing.signTransaction(transactionHashHex);
        return signed;
    }

    private submitTransaction = async (transactionHashHex: string) => {
        const body = {
            PostHasTransactionHexhHex: transactionHashHex
        };
        const response = await this.post("v0/submit-transaction", body);
        if (response.ok) {
            let json = await response.json();
            if (!!json.Transaction) {
                return true
            }
        }
        return false;
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