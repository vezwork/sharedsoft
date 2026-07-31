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

export const ws = new WebSocket("http://192.168.0.126:8088");

export const id = initOrLoad("id", crypto.randomUUID());
let head = initOrLoad("head", 0);
export const messagesFromIds = initOrLoad("messagesFromIds", {});
// messagesEl.innerText = JSON.stringify(messagesFromIds, null, 2);

const heads = () => objectValueMap(messagesFromIds, (msgs) => msgs.at(-1).head);

const getEpochMs = () => new Date().getTime();
export const send = (message) => {
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
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(data));
  receive(data.data);
};

const listeners = [];
export const onReceive = (f) => {
  listeners.push(f);
};

const update = () => {
  if (ws.readyState === ws.OPEN)
    ws.send(
      JSON.stringify({
        type: "updateRequest",
        heads: heads(),
      })
    );
};

const receive = (data) => {
  const messagesFromId = messagesFromIds[data.id];
  if (messagesFromId !== undefined) {
    if (data.head !== messagesFromId.at(-1).head + 1) {
      update();
    } else {
      messagesFromId.push(data);
    }
  } else {
    if (data.head !== 1) {
      update();
    } else {
      messagesFromIds[data.id] = [data];
    }
  }
  localStorage.setItem("messagesFromIds", JSON.stringify(messagesFromIds));
  //   messagesEl.innerText = JSON.stringify(messagesFromIds, null, 2);
  listeners.forEach((f) => f());
};

ws.addEventListener("close", (e) => {
  console.log("WEBSOCKET CLOSED!");
});
ws.addEventListener("error", (e) => {
  console.log("WEBSOCKET ERROR!");
});
ws.addEventListener("open", (e) => {
  ws.addEventListener("message", (e) => {
    const message = JSON.parse(e.data);

    if (message.type === "updateResponse") {
      message.messages.forEach(receive);
    }

    if (message.type === "updateSingleIdRequest") {
      ws.send(
        JSON.stringify({
          type: "updateResponse",
          id: message.id,
          messages: messagesFromIds[message.id].slice(message.head ?? 0),
        })
      );
    }

    if (message.type === "updateRequest") {
      const myHeads = heads();
      objectValueMap(myHeads, (myHead, id) => {
        if (message.heads[id] === undefined || myHead > message.heads[id]) {
          ws.send(
            JSON.stringify({
              type: "updateResponse",
              id,
              messages: messagesFromIds[id].slice(message.heads[id]),
            })
          );
        }
        if (myHeads[id] === undefined || message.heads[id] > myHead) {
          ws.send(
            JSON.stringify({
              type: "updateSingleIdRequest",
              id,
              head: myHeads[id],
            })
          );
        }
      });
    }

    if (message.type === "message") {
      receive(message.data);
    }
  });

  update();
});
