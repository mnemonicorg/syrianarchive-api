# The Littlefork HTTP.

Wrap littlefork around a HTTP API.

## Installation

    git clone git@gitlab.com:littlefork/littlefork-api.git
    cd littlefork-api
    npm install

The littlefork API is configured using environment variables. It's possible to
configure options in a local file, `.env`. This file will _not_ be added to
the git repository, an entry in the `.gitignore` prevents that.

    cp .env.example
    cat .env  // Edit as necessary

-   `LF_API_PORT` :: The port to listen on. Defaults to 6667.
-   `LF_API_DATA_DIR` :: The path to the storage directory. Defaults to `./data`.
-   `LF_API_KEY` :: The api key that should be sent in a header to auth the request

## Usage

To simply run the API, start the server: `npm run server`. This starts a
server on the port defined in the environment as `LF_API_PORT`.

There are local targets to run the linting, documentation building and unit
testing. Simply start a development setup: `npm run dev`.

## Documentation

To build the latest version of this readme run: `npm run docs:api`. This
rebuilds this readme file.

The HTTP routes are documented as well. To build them run: `npm run docs:rest`.
This will build HTML documentation for the HTTP routes. They can be found in
`docs/rest`.

    firefox docs/rest/index.html

To build all docs, run: `npm run docs`.

## Development

All functions are curried:

```js
read('path/to/dir', 'project'); // =
read('path/to/dir')('project');
```

curl test:
`curl -v -H "apikey: haha" http://localhost:8666/projects`

### fs-db

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### read

Read a file and return it as parsed JSON.

`read :: String -> String -> Future Json`

**Parameters**

-   `p` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path of the node.
-   `f` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the file.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>** The parsed JSON that was read from the file.

#### init

Initialize a node.

`init :: String -> Future ()`

**Parameters**

-   `p` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path of the node.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)>** Returns `Unit`, pure side effect.

#### write

Write data into a node. Initialize the node recursively if it doesn't exist.

`write :: String -> String -> {} -> Future ()`

**Parameters**

-   `p` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path of the node.
-   `f` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the file.
-   `d` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The data to store.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null)>** Returns `Unit`, pure side effect.

#### readNode

Read a node for all data and sub nodes.

`readNode :: String -> Future [[Object], [String]]`

    const [fs, ds] = readNode('data/projects');
    // fs => [{...}, {...}]
    // ds = ['other', 'nodes']

**Parameters**

-   `p` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path of the node.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>, [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>>>** Returns an array
tuple with the first element being a list of data units, and the
second element a list of sub nodes.

#### list

List the data in a node.

`list :: String -> Future [Object]`

**Parameters**

-   `p` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path of the node.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>>** A list of data units.
