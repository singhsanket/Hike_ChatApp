const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express(); //init the express;
app.use(cors()); //allow the url to connect
//create the server
const server = http.createServer(app); //converting the express app to the http server ,its important to create a server object so that we can run the socket.io

//now create the circuit for the socket AND Allow TO CONNECT  with the frontend
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    method: ["GET", "POST"],
  },
});

//create the user object for soting the online user with there socket id
let users = {};

//start linsenting the events
io.on("connection", (socket) => {
  //new user joined
  socket.on("joined", (username) => {
    console.log(`${username} is OnLine`);
    users[username] = socket.id; //store the user whith ther socket id

    //now broadcast to other user in the application
    socket.broadcast.emit("userJoined", `${username} is OnLine Now`);
    io.emit("UserList", Object.keys(users));
  });

  //send message to all the receiver includin the sender
  socket.on("sendMessage", ({ message, from }) => {
    const user = users[socket.id] || "unknowun";
    io.emit("receivedMessage", { message, user: from });
  });

  //private message
  socket.on("personalMessage", ({ to, message, from }) => {
    const userId = users[to];
    if (userId) {
      io.to(userId).emit("personalMessage", { from, message, isPrivate: true });
      socket.emit("privateMessage",{
        to, message
      });
    }
  });

  //disconnect
  socket.on("disconnect", () => {
    const userId = users[socket.id];
    if (userId) {
      socket.broadcast.emit("UserLeft", `${userId} Offline`);
      delete users[socket.id];
      //return the list
      io.emit("userList", Object.keys(users));
    }
  });
});

//listen the server
server.listen(5000, () => {
  console.log("your server is runing at the port number 5000");
});
