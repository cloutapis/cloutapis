import db from "../../models/index";

export class PinnedPostsManager {

    public pinPost = async (publicKey: string, postHashHex: string) => {
        const dbObject = {
            publicKey,
            postHashHex
        };

        const foundItem = await db.PinnedPosts.findOne({ where: { publicKey } });
        if (!foundItem) {
            await db.PinnedPosts.create(dbObject);
        } else {
            await db.PinnedPosts.update(dbObject, { where: { publicKey } });
        }
    }

    public unpinPost = async (publicKey: string, postHashHex: string) => {
        const deletedCount = await db.PinnedPosts.destroy(
            {
                where: {
                    publicKey,
                    postHashHex
                }
            }
        );
        return deletedCount;
    }

    public getPinnedPost = async (publicKey: string) => {
        const pinnedPost = await db.PinnedPosts.findOne({ where: { publicKey } });
        return { postHashHex: pinnedPost?.postHashHex };
    }
}
