// end-to-end encryption in the browser reference:
// https://plus.excalidraw.com/blog/end-to-end-encryption

import { importKey, encrypt, decrypt } from "./encryption.js";

const createKey = async () => {
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 128 },
    true, // extractable
    ["encrypt", "decrypt"]
  );
  const objectKey = (await window.crypto.subtle.exportKey("jwk", key)).k;
  window.location.hash = `key=${objectKey}`;
  localStorage.setItem("key", objectKey);
  return { key, objectKey };
};

const getKey = async () => {
  try {
    const objectKey =
      localStorage.getItem("key") ?? window.location.hash.slice("#key=".length);
    localStorage.setItem("key", objectKey);

    return importKey(objectKey);
  } catch (e) { }
};


const { objectKey, key } = (await getKey()) ?? createKey();

const ws = new WebSocket("wss://relay.bonto.run");
ws.addEventListener("open", (e) => {
  document.body.prepend("WEBSOCKET OPENED!");
});
ws.addEventListener("close", (e) => {
  document.body.prepend("WEBSOCKET CLOSED!");
});
ws.addEventListener("error", (e) => {
  document.body.prepend("WEBSOCKET ERROR!");
});

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
