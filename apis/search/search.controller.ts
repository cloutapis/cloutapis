import * as express from 'express';
import db, { sequelize } from "../../models/index";
import SearchManager from './search-manager'

class SearchController {
    private searchManager = new SearchManager();
    public path = '/search';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get('/search', this.performSearch);
    }

    performSearch = async (request: express.Request, response: express.Response) => {
        const { q } = request.query;
        const results = await this.searchManager.performSearch(q)

        response.send(results);
    }
}

export default SearchController;