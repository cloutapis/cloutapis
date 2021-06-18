import express from 'express';
import path from 'path';
import CloutTagsController from './apis/clouttags/clouttags.controller';


const PORT = process.env.PORT || 5000;
const server = express();

express()
  .use(express.static(path.join(__dirname, '../public')))
  .use('/', new CloutTagsController().router)
  .set('views', path.join(__dirname, '../views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
