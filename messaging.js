import { send as esend, onReceive as onRec, onConnect } from "./encrypted.js";

const initOrLoad = (key, initValue) => {
  const item = localStorage.getItem(key);
  if (item !== null) return JSON.parse(item);

  localStorage.setItem(key, JSON.stringify(initValue));
  return initValue;
};
const objectValueMap = (arg, fn) =>
  Object.fromEntries(
    Object.entries(arg).map(([key, value]) => [key, fn(value, key)])
  );

export const id = initOrLoad("id", crypto.randomUUID());
let head = initOrLoad("head", 0);
export const messagesFromIds = initOrLoad("messagesFromIds", {});
// messagesEl.innerText = JSON.stringify(messagesFromIds, null, 2);

const heads = () => objectValueMap(messagesFromIds, (msgs) => msgs.at(-1).head);

const getEpochMs = () => new Date().getTime();
export const send = (message, dontNetwork) => {
  head++;
  localStorage.setItem("head", JSON.stringify(head));
  const data = {
    type: "message",
    data: {
      id,
      message,
      head,
      time: getEpochMs(),
    },
  };
  if (!dontNetwork) esend(data);
  receive(data.data, true);
};

const listeners = [];
export const onReceive = (f) => {
  listeners.push(f);
};

const update = () =>
  esend({
    type: "updateRequest",
    heads: heads(),
  });

const receive = (data, dontNetwork) => {
  const messagesFromId = messagesFromIds[data.id];
  if (messagesFromId !== undefined) {
    if (data.head !== messagesFromId.at(-1).head + 1) {
      if (!dontNetwork) update();
    } else {
      messagesFromId.push(data);
    }
  } else {
    if (data.head !== 1) {
      if (!dontNetwork) update();
    } else {
      messagesFromIds[data.id] = [data];
    }
  }
  localStorage.setItem("messagesFromIds", JSON.stringify(messagesFromIds));
  //   messagesEl.innerText = JSON.stringify(messagesFromIds, null, 2);
  if (!dontNetwork) listeners.forEach((f) => f());
};

onConnect(() => {
  update();
});
onRec((message) => {
  if (message.type === "updateResponse") {
    message.messages.forEach(receive);
  }

  if (message.type === "updateSingleIdRequest") {
    esend({
      type: "updateResponse",
      id: message.id,
      messages: messagesFromIds[message.id].slice(message.head ?? 0),
    });
  }

  if (message.type === "updateRequest") {
    const myHeads = heads();
    objectValueMap(myHeads, (myHead, id) => {
      if (message.heads[id] === undefined || myHead > message.heads[id]) {
        esend({
          type: "updateResponse",
          id,
          messages: messagesFromIds[id].slice(message.heads[id]),
        });
      }
      if (myHeads[id] === undefined || message.heads[id] > myHead) {
        esend({
          type: "updateSingleIdRequest",
          id,
          head: myHeads[id],
        });
      }
    });
  }

  if (message.type === "message") {
    receive(message.data);
  }
});
