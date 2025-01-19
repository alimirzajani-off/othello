import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import WebSocket from "ws";
import Message from "./models/Message.js"
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket server
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Received:", message);

    // Echo the message back to the client
    // ws.send(`Server: ${message}`);
    const parsedMessage = JSON.parse(message);

    // Save to MongoDB
    const newMessage = new Message({
      content: parsedMessage.content,
      sender: parsedMessage.sender,
    });

    await newMessage.save();

    // Broadcast to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(newMessage));
      }
    });
  });
  });
  

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Start HTTP and WebSocket server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
