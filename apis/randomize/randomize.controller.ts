import * as express from "express";
import asyncHandler from "express-async-handler";
import { TypeHelper } from "../../helpers/typeHelper";
import RandomizeManager, { RandomizeRequestState } from "./randomize-manager";

class RandomizeController {
  private randomizeManager = new RandomizeManager();
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get("/test", asyncHandler(this.runContest));
  }

  runContest = async (
    request: express.Request,
    response: express.Response
  ) => {
    const { competitionPostHashHex, requestPostHashHex, numToPick, action, message }: { competitionPostHashHex?: string, requestPostHashHex?: string, numToPick?: number, action?: string, message?: string } = request.query;

    let contest = {
        competitionPostHashHex: competitionPostHashHex ?? "",
        requestPostHashHex: requestPostHashHex ?? "",
        numToPick: numToPick ?? 0,
        action: action ?? "",
        message: message,
        state: RandomizeRequestState.pending ?? ""
    }
    const results = await this.randomizeManager.drawAndNotifyContest(contest)

    response.send(results);
  };
}

export default RandomizeController;
