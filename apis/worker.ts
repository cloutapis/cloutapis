import CloutTagManager from "./clouttags/clouttag-manager";
import SearchManager from "./search/search-manager";
import BitcloutAPI from "../lib/bitclout/bitclout";
import cron from "node-cron";
import RandomizeManager from "./randomize/randomize-manager";

const bitclout = new BitcloutAPI();

const cloutTagManager = new CloutTagManager();
const searchManager = new SearchManager();
const randomizeManager = new RandomizeManager();

// CloutTag Worker
cron.schedule(
  "0/30 * * * * * *",
  async () => {
    console.log("Triggering fetch worker");
    try {
      const posts = await bitclout.getLatestPosts();
      Promise.all([
        cloutTagManager.processAndSaveCloutTags(posts),
        searchManager.indexPosts(posts),
        randomizeManager.fetchAndRespondToRandomizeRequests()
      ]).then((values) => {
        // console.log(values);
      });
    } catch (err) {
      console.error(`Fetch worker failed fetch with error: ${err}`);
    }
  },
  {}
);
