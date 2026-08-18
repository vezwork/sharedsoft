export const importKey = async (objectKey) => {
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
};
// reference: https://github.com/mathiasbynens/base64/issues/13
function ab2str(buf) {
    const uint8array = new Uint8Array(buf)
    let result = ''
    for (let i = 0; i < uint8array.length; i += 1024) {
        result += String.fromCharCode.apply(null, uint8array.subarray(i, i + 1024))
    }
    return result
}
function str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
export const decrypt = async (key, encrypted) => {
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
export const encrypt = async (key, message) => {
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