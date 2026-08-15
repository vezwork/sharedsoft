// end-to-end encryption in the browser reference:
// https://plus.excalidraw.com/blog/end-to-end-encryption

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

const importKey = async () => {
  try {
    const objectKey =
      localStorage.getItem("key") ?? window.location.hash.slice("#key=".length);
    localStorage.setItem("key", objectKey);
    const key = await window.crypto.subtle.importKey(
      "jwk",
      {
        k: objectKey,
        alg: "A128GCM",
        ext: true,
        key_ops: ["encrypt", "decrypt"],
        kty: "oct",
      },
      { name: "AES-GCM", length: 128 },
      false, // extractable
      ["encrypt", "decrypt"]
    );
    return { objectKey, key };
  } catch (e) { }
};

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}
function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
const decrypt = async (key, encrypted) => {
  const combinedPayload = str2ab(encrypted);
  const iv = combinedPayload.slice(0, 12);
  const ciphertext = combinedPayload.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  const decoded = new TextDecoder().decode(new Uint8Array(decrypted));
  return JSON.parse(decoded);
};
const encrypt = async (key, message) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aenc = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(message))
  );
  const ciphertext = new Uint8Array(aenc);
  const combinedPayload = new Uint8Array(iv.length + ciphertext.length);
  combinedPayload.set(iv, 0);
  combinedPayload.set(ciphertext, iv.length);

  return ab2str(combinedPayload);
};

const { objectKey, key } = (await importKey()) ?? createKey();

const ws = new WebSocket("wss://relay.bonto.run");
ws.addEventListener("open", (e) => {
  document.body.append("WEBSOCKET OPENED!");
});
ws.addEventListener("close", (e) => {
  document.body.append("WEBSOCKET CLOSED!");
});
ws.addEventListener("error", (e) => {
  document.body.append("WEBSOCKET ERROR!");
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
