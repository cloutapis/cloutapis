import db from "../../models/index";

export class SavedPostsManager {
    public savePost = async (publicKey: string, postHashHex: string, timestampNanos: number) => {
        const dbObject = {
            publicKey,
            postHashHex,
            postedAt: new Date(timestampNanos / 1000000)
        };
        await db.SavedPosts.create(dbObject);
    }

    public unsavePost = async (publicKey: string, postHashHex: string) => {
        const deletedCount = await db.SavedPosts.destroy(
            {
                where: {
                    publicKey,
                    postHashHex
                }
            }
        );

        return deletedCount;
    }

    public getSavedPosts = async (publicKey: string, numToFetch: number, offset: number) => {
        const result = await db.SavedPosts.findAll(
            {
                limit: numToFetch,
                offset: offset,
                where: {
                    publicKey
                },
                order: [["postedAt", "DESC"]],
            }
        ).then((posts) => posts.map((post) => post.postHashHex));
        return result;
    }
}
