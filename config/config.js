if ((process.env.NODE_ENV || 'development') == 'development') {
  require('dotenv').config();
}

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

module.exports = {
  "development": {
    "username": DB_USERNAME,
    "password": DB_PASSWORD,
    "database": "cloutapis",
    "host": DB_HOST,
    "dialect": "postgres"
  },
  "production": {
    "username": DB_USERNAME,
    "password": DB_PASSWORD,
    "database": DB_DATABASE,
    "host": DB_HOST,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
         "require": true,
         "rejectUnauthorized": false
      }
    }
  }
}
