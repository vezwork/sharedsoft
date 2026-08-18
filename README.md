## How to run

- `npm i && npm run relay` to run a basic websocket message string forwarding
  server. Used by clients to share data.
- `npm i && npm run peer` to connect a node.js process to the shared data and
  back it up to a folder named `scratch` using the node-localstorage library
  - then, you run npm run client
  - then, copy from scratch/key to the profile my key box
  - then, reload client page
  - or, you can get the key by opening the client and grabbing it from the
    profile my key box, and putting it into scratch/key
- `npm run client` runs a basic http-server that serves static files like
  index.html, manifest.json, and icon.png. Clients require a relay to be running
  in order to share data.

## TODO

- make UI reactive (user -> owing, connection state, last sync time)
- wait for reply from `fetch('https://relay.bonto.run')` before init'ing
  connection
- revive "peer" node.js client (mostly requires passing an encryption key to the
  script)
- super basic service worker registration for offline support
- make expense log better; group by month and make each transaction more
  visually parseable
