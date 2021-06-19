import cron from 'node-cron'
import PostParser from './post-parser'

const postParser = new PostParser()

cron.schedule('0/30 * * * * * *', async () => {
    console.log('Triggering fetch worker');
    await fetchLatestHashTags();
}, {});

console.log(`Started fetch worker`);

const fetchLatestHashTags = async () => {
    try {
        postParser.fetchAndSaveLatestTaggedPosts();
    } catch(err) {
        console.error(`Fetch worker failed fetch with error: ${err}`);
    }
};