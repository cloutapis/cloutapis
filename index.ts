import express from 'express';
import path from 'path';
import CloutTagsController from './apis/clouttags/clouttags.controller';
import SearchController from './apis/search/search.controller'


const PORT = process.env.PORT || 5000;
const server = express();

express()
  .use(express.static(path.join(__dirname, '../public')))
  .use('/', new CloutTagsController().router)
  .use('/', new SearchController().router)
  .get('/', (req, res) => res.redirect(301, 'https://www.cloutapis.com'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
