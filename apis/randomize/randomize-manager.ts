import BitcloutAPI from "../../lib/bitclout/bitclout";
import db from "../../models/index";

export interface RandomizeRequest {
    competitionPostHashHex: string;
    requestPostHashHex: string;
    numToPick: number;
    action: string;
    message?: string;

    // Results
    state: RandomizeRequestState;
    error?: string
    winningUsernames?: string[]
}

enum RandomizeRequestAction {
    reply = "repl",
    diamond = "diamond",
    reclout = "reclout"
}

export enum RandomizeRequestState {
    pending = "pending",
    invalid = "invalid",
    complete = "complete",
    failed = "failed"
}

export class RandomizeManager {
    private bitclout = new BitcloutAPI();

    public fetchAndRespondToRandomizeRequests = async () => {
        const newRandomizeRequests = await this.fetchNewRandomizeRequests();
        if (newRandomizeRequests == undefined) {
            return
        }
        for(let randomizeRequest of newRandomizeRequests) {
            await this.drawAndNotifyContest(randomizeRequest);
        }
    };

    public drawAndNotifyContest = async (request: RandomizeRequest) => {
        try {
            let contestants = await this.getContestantsForRandomizeRequest(request);
            let drawnRequest = await this.drawContest(request, contestants);
            await this.notifyWinners(drawnRequest);
        }
        catch (e) {
            console.error(`Failed to draw contest: ${request.requestPostHashHex} error: ${e}`);
        }
    };

    private notifyWinners = async (request: RandomizeRequest)=> {
        if (!request.winningUsernames ) {
            return;
        }
        var messageBody = `Huzzah! Congraulations to `;
        for (let winner of request.winningUsernames) {
            messageBody += `@${winner} `;
        }

        if (!!request.message) {
            messageBody += "\n\n";
            messageBody += request.message;
        }

        console.log(`Message: ${messageBody}`);
        this.bitclout.createPost(messageBody, request.competitionPostHashHex);
    };

    private drawContest = async (request: RandomizeRequest, contestants): Promise<RandomizeRequest> => {
        console.log(`contestants: ${JSON.stringify(contestants)}`);
        if (request.numToPick > contestants.length) {
            //TODO: Is this the right policy?
            request.winningUsernames = contestants.map(function (contestant) { return contestant.Username });
            return request;
        }

        var winners: string[] = [];
        for (var i = 0; i < request.numToPick; i++) {
            const selectedIndex = Math.floor(Math.random() * (contestants.length - 1));
            console.log(`Selected: ${selectedIndex}`);
            var winner = contestants[selectedIndex].Username;
            if (winners.includes(winner)) {
                i--;
            }
            else {
                winners.push(winner);
            }
        }
        request.winningUsernames = winners;
        return request;
    };

    private getContestantsForRandomizeRequest = async (request: RandomizeRequest) => {
        var candidates = [];

        switch (request.action as RandomizeRequestAction) {
            case RandomizeRequestAction.reply:
                console.log("Reply action");
                let post = await this.bitclout.getSinglePost(request.competitionPostHashHex, 1000);
                let replyUsers = post?.PostFound?.Comments?.map(function(comment) {
                    return comment.ProfileEntryResponse;
                });
                //TODO: Filter so that multiple reclouts don't mean multiple entries?
                candidates = replyUsers
                break;
            case RandomizeRequestAction.reclout:
                console.log("Reclout action");
                let reclouters = await this.bitclout.getRecloutersForPost(request.competitionPostHashHex, 1000);
                let quoteReclouters = await this.bitclout.getQuoteRecloutersForPost(request.competitionPostHashHex, 1000);
                //TODO: Filter so that multiple reclouts don't mean multiple entries?
                candidates = [].concat(reclouters).concat(quoteReclouters)
                break;
            case RandomizeRequestAction.diamond:
                console.log("Diamond action");
                //TODO: Implement diamonds
                break;
            default:
                console.log("No action");
                break;
        }
        return candidates;
    };

    private fetchNewRandomizeRequests = async () => {
        const { Notifications, ProfilesByPublicKey, PostsByHash } = await this.bitclout.getNotifications("BC1YLgonSFPGDNE67EY6LytqHqvkYZYGHz3wECuCCLwYqorwhLv4VJG")
        console.log(`Notifications: ${Notifications}`);
        let lastSendIndex = await this.getLastProcessedNotificationIndex();
        if (!lastSendIndex) {
            console.log('DB reset. Ignoring first run.');
            let maxIndex = Notifications[0].Index;
            this.setLastProcessedNotificationIndex(maxIndex);
            return;
        }

        var randomizeRequests: RandomizeRequest[] = [];
        for (let notification of Notifications) {
            const randomizeRequest = await this.randomizeRequestFromComponents(notification, lastSendIndex, PostsByHash);
            if (!!randomizeRequest) {
                randomizeRequests.push(randomizeRequest)
            }            
        }
        this.setLastProcessedNotificationIndex(maxIndex);
        return randomizeRequests;
    }

    private randomizeRequestFromComponents = async (notification, lastSendIndex, PostsByHash) => {
        const type = notification.Metadata?.TxnType;
        const index = notification.Index;
        const inReplyToPost = notification.Metadata?.SubmitPostTxindexMetadata?.ParentPostHashHex;

        // Should not process post
        if (type != "SUBMIT_POST" || !inReplyToPost || index <= lastSendIndex) {
            console.log(`Not a valid randomize request`);
            return undefined;
        }
        
        // The reply to post may or may not be in the PostsByHash
        let post = await this.bitclout.getSinglePost(inReplyToPost);
        let notificationOriginator = notification.Metadata?.TransactorPublicKeyBase58Check;
        let originalPoster = post.PostFound?.PosterPublicKeyBase58Check;

        // Eligible for evaluation
        if (!notificationOriginator || (notificationOriginator != originalPoster)) {
            console.log(`Invalid requstor: ${notificationOriginator} original poster: ${originalPoster}`);
            return undefined;
        }

        let randomizeRequestPostHashHex = notification.Metadata?.SubmitPostTxindexMetadata?.PostHashBeingModifiedHex;
        let postBody = PostsByHash[randomizeRequestPostHashHex]?.Body;

        // Pattern designed to match reply|replies or reclout|reclouters etc..
        const regexp = /@randomize\s*([0-9]+)\s*(reclout|diamond|repl)[a-z]*[ ]*(.*)/g;
        const matches = regexp.exec(postBody);
        if (matches == null || matches.length < 3) {
            console.log(`Invalid request text`);
            return null;
        }

        const numToPick = matches[1];
        const action = matches[2]?.toLowerCase();
        const message = matches.length >= 4 ? matches[3] : undefined;
        return {
            competitionPostHashHex: inReplyToPost,
            requestPostHashHex: randomizeRequestPostHashHex,
            numToPick: Number(numToPick),
            action: action,
            message: message,
            state: RandomizeRequestState.pending
        }

        return undefined;
    }

    private getLastProcessedNotificationIndex = async () => {
        let lastIndex = await db.ApiMetadata.findOne({where: {
            api: 'randomize',
            key: 'lastSeenIndex'
        }});
        if (!!lastIndex) {
            return lastIndex.intValue;
        }
        else {
            return undefined;
        }
    }

    private setLastProcessedNotificationIndex = async (newLastIndex) => {
        console.log(`Setting last run index to: ${newLastIndex}`)
        let lastIndex = await db.ApiMetadata.findOne({where: {
            api: 'randomize',
            key: 'lastSeenIndex'
        }});
        if (!!lastIndex) {
            lastIndex.intValue = newLastIndex;
            await lastIndex.save();
        }
        else {
            await db.ApiMetadata.create({
                api: 'randomize',
                key: 'lastSeenIndex',
                intValue: newLastIndex
            });
        }
    }
 
}

export default RandomizeManager;
