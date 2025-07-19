const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://hike-chat-app-rose.vercel.app"],
    methods: ["GET", "POST"],
  },
});

// Store users as socket.id → username
let users = {};

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  // User joins
  socket.on("joined", (username) => {
    users[socket.id] = username;
    console.log(`${username} is Online`);

    // Notify everyone
    socket.broadcast.emit("joined", `${username} joined the chat`);
    io.emit("UserList", Object.values(users));
  });

  // Global chat
  socket.on("sendMessage", ({ message, from }) => {
    io.emit("receivedMessage", { message, user: from });
  });

  // Private chat
  socket.on("personalMessage", ({ to, message, from }) => {
    const targetSocket = Object.keys(users).find((id) => users[id] === to);
    if (targetSocket) {
      io.to(targetSocket).emit("personalMessage", { from, message });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    const name = users[socket.id];
    console.log(`❌ ${name} disconnected`);
    delete users[socket.id];
    io.emit("joined", `${name} left the chat`);
    io.emit("UserList", Object.values(users));
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
