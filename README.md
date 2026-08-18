## How to run

### Client only

```sh
npm run client
```

Runs a basic http-server that serves static files like index.html,
manifest.json, and icon.png. Use if you want to open esse-split and add expenses
in the UI.

### Access expense data on disk

Run to connect a node.js process to the shared data and back it up to a folder
named `scratch` using the node-localstorage library. Use this if you want an
easy way to view the expense data on disk, which is otherwise hidden away in
local storage in the client.

1. From a running client, copy the key, then pass it

```sh
KEY=<KEY> npm run peer-key-setup
```

2. Run the peer script

```sh
npm i && npm run peer
```

3. Add expenses via the client and view the data in
   [scratch/messagesFromIds](scratch/messagesFromIds)

### Relay

```sh
npm i && npm run relay
```

Runs a basic websocket message string forwarding server. Used by clients and
peers to share data. This is currently deployed on bonto.run, so we don't have
to run this as part of dev or prod. However, if our bonto.run ever goes down, we
will need to host a new relay.

## TODO

- make UI reactive (user -> owing, connection state, last sync time)
- wait for reply from `fetch('https://relay.bonto.run')` before init'ing
  connection
- super basic service worker registration for offline support
- make expense log better; group by month and make each transaction more
  visually parseable
