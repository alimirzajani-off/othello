import { WebSocketServer } from "ws";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

const rooms = {};

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    const { type, payload } = data;

    if (type === "join_room") {
      const { roomId } = payload;

      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }

      rooms[roomId].push(ws);
      console.log(`User joined room: ${roomId}`);

      rooms[roomId].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "opponent_joined" }));
        }
      });
    }

    if (type === "move") {
      const { roomId, move } = payload;

      rooms[roomId].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "move", payload: move }));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");

    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((client) => client !== ws);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
