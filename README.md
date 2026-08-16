## How to run

- `npm run relay` to run a basic websocket message string forwarding server.
  Used by clients to share data.
- `npm run peer` to connect a node.js process to the shared data and back it up
  to a folder named `scratch` using the node-localstorage library
  - this has fallen into disrepair since add encryption. To get this script
    working again it requires making it so we ca pass an encryption key to the
    script that it can use.
- `npm run client` runs a basic http-server that serves static files like
  index.html, manifest.json, and icon.png. Clients require a relay to be running
  in order to share data.

## TODO

- store key so installed app can access it without it being in the url
- make UI reactive (user -> owing, connection state, last sync time)
- wait for reply from `fetch('https://relay.bonto.run')` before init'ing
  connection
- revive "peer" node.js client (mostly requires passing an encryption key to the
  script)
- super basic service worker registration for offline support
- sum things up properly if different currencies are used
- decouple payer from the "I am owed" text
- make expense log better; group by month and make each transaction more
  visually parseable
