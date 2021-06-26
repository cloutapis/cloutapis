import * as express from "express";
import SearchManager from "./search-manager";
import asyncHandler from "express-async-handler";
import { TypeHelper } from "../../helpers/typeHelper";

class SearchController {
  private searchManager = new SearchManager();
  public path = "/search";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get("/search", asyncHandler(this.performSearch));
  }

  performSearch = async (
    request: express.Request,
    response: express.Response
  ) => {
    const { q, numToFetch, offset }: { q?: string; numToFetch?: number; offset?: number } = request.query;

    let numToFetchNum = Number(numToFetch);
    if (!TypeHelper.isNumber(numToFetchNum)) {
      numToFetchNum = 20;
    }

    let offsetNum = Number(offset);
    if (!TypeHelper.isNumber(offsetNum)) {
      offsetNum = 0;
    }
    
    const results = await this.searchManager.performSearch(q, numToFetch, offset);

    response.send(results);
  };
}

export default SearchController;
