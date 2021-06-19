<p align="center" >

<img width="354" alt="CleanShot 2021-06-19 at 18 18 39@2x" src="https://user-images.githubusercontent.com/1068437/122656684-d3f7dc00-d12a-11eb-95b3-0792c9c0443e.png" alt="CloutAPIs Logo" >
</p>
<h3 align="center" style="margin-top:-40px;">
  Open-source APIs to make building on BitClout easier, faster and more fun.
</h3>

# What is CloutAPIs?
CloutAPIs is a set of APIs that sit **on-top** of the BitClout blockchain to provide simpler, richer or additional functionality and hopefully will prevent multiple developers from having to implement the same features.

In some cases, CloutAPIs will augment blockchain information with data stored off-chain for informational, metadata or optimization purposes.

## Why?

As early developers on BitClout we saw two trends that we hope to help avoid continuing:

1. Many developers all having to write the same functionality to get their apps up and running
2. Developers creating siloed "destinations" for individual features

We don't believe that the future of the platform is one node with feature X, and another with feature Y, but rather a framework of features that are collaborated on. In time, we hope to build an economic framework around this too.


# APIs
**CloutTags**: Easily show trending CloutTags in your application, supporting trending, search and listing posts.

**More coming soon**: Have an idea... create a GitHub issue :)

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
Make sure you have [Node.js](http://nodejs.org/) and [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable) installed.

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

