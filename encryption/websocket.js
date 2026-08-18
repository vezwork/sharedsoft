// end-to-end encryption in the browser reference:
// https://plus.excalidraw.com/blog/end-to-end-encryption

import { importKey, encrypt, decrypt } from "./utils.js";

const createKey = async () => {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 128 },
    true, // extractable
    ["encrypt", "decrypt"]
  );
  const objectKey = (await crypto.subtle.exportKey("jwk", key)).k;

  // TODO: location is not available when running `npm run peer` so we shouldn't even get here
  // this sets the hash param in the url after the key is created, but this is irrelevant and not possible when running the script directly
  // so remove it
  // location.hash = `key=${objectKey}`;
  localStorage.setItem("key", objectKey);
  return { key, objectKey };
};

const getKey = async () => {
  try {
    // TODO: remove the #key= altogether since you can set it in the ui
    const objectKey =
      localStorage.getItem("key") ?? location.hash.slice("#key=".length);

    // TODO: this is only useful for location.hash.slice("#key=".length) and doesn't need to happen for local storage get key
    localStorage.setItem("key", objectKey);

    return await importKey(objectKey);
  } catch (e) {
  }
};


const { objectKey, key } = (await getKey()) ?? await createKey();

const ws = new WebSocket("wss://relay.bonto.run");

// when running `npm run peer`, ReferenceError: document is not defined, so commenting this out
// ws.addEventListener("open", (e) => {
//   document.body.prepend("WEBSOCKET OPENED!");
// });
// ws.addEventListener("close", (e) => {
//   document.body.prepend("WEBSOCKET CLOSED!");
// });
// ws.addEventListener("error", (e) => {
//   document.body.prepend("WEBSOCKET ERROR!");
// });

export const send = async (message) => {
  if (ws.readyState === ws.OPEN) {
    ws.send(await encrypt(key, message));
  }
};

const listeners = [];
export const onReceive = (f) => {
  listeners.push(f);
};
const connectListeners = [];
export const onConnect = (f) => {
  connectListeners.push(f);
};

ws.addEventListener("open", (e) => {
  connectListeners.forEach((f) => f());
});
ws.addEventListener("message", async (e) => {
  const decoded = await decrypt(key, e.data);
  listeners.forEach((f) => f(decoded));
});
