// minimal websocket message broadcast server.
// broadcasts incoming messages to all clients,
// except the client that sent the message

import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8088 });
console.log("server running on port 8088");

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });
});
