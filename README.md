# cloutapis
A set of helpful APIs for BitClout.

# APIs
* Clouttags: 

## Hosted APIs
All APIs are available at `https://api.cloutapis.com/`. Alternatively, you can clone, and host your own version of them.

You are welcome to use our hosted versions for development, although know that we intend for them to move to a small fee in BitClout to use in the future.

## Clouttags
Clouttags let users create and browse the platform with semi-structured tags. Ideally, clouttags allow subcomunities to form and more organic discovery to occur!

### GET `/clouttag/:tag`

### GET `/clouttag/:tag/posts/:limit/:offset`

### GET `/clouttags/trending`

### GET `/clouttags/search/:tagPrefix`

## Local Setup]
Make sure you have [Node.js](http://nodejs.org/), [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable) and the [Heroku CLI](https://cli.heroku.com/) installed.

```
git clone https://github.com/cloutapis/cloutapis
cd cloutapis
yarn
```

### Database
* A local Postgres instance running
* A user with username `cloutapis`, password `cloutapis` (these are declared in `.env`)

Once you have your local postgres instance running with the user created, you can run:

```
yarn db:create
yarn db:migrate
```

### Building Locally
The typescript needs to be built before running. This only takes a few seconds:

```sh
yarn build
yarn start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Running the worker locally
The worker can be started after `yarn build`:

```
node dist/apis/clouttags/fetch/worker.js
```

## Deploying to Heroku

```
$ git push heroku main
$ heroku open
``
