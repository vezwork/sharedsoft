import { messagesFromIds, onReceive } from "./messaging.js";
export { send as sendEvent, id } from "./messaging.js";

let sortedMessages = [];

const listeners = [];
export const onEvent = (f) => {
  listeners.push(f);
  f(sortedMessages);
};

export const updateState = () => {
  const messages = Object.values(messagesFromIds).flat();
  sortedMessages = messages.sort((a, b) => a.time - b.time);
  listeners.forEach((f) => f(sortedMessages));
};
onReceive(updateState);
updateState();
