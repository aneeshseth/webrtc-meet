const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: true
  }
});

const rooms = {};
const users = {};

io.on('connection', (socket) => {
  console.log('a user connected ' + socket.id);

  socket.on("disconnect", (params) => {
    Object.keys(rooms).map(roomId => {
      rooms[roomId].users = rooms[roomId].users.filter(x => x !== socket.id)
    })
    delete users[socket.id];
  })

  socket.on("join", (params) => {
    const roomId = params.roomId;
    users[socket.id] = {
      roomId: roomId
    }
    if (!rooms[roomId]) {
      rooms[roomId] = {
        roomId,
        users: []
      }
    }
    rooms[roomId].users.push(socket.id);
    console.log("user added to room " + roomId);
  });

  socket.on("localDescription", (params) => {
    console.log("local description")
    let roomId = users[socket.id].roomId;
    let otherUsers = rooms[roomId].users;
    otherUsers.forEach(otherUser => {
      console.log(otherUser)
      if (otherUser !== socket.id) {
        console.log("local description send")
        io.to(otherUser).emit("localDescription", {
            description: params.description
        })
      }
    })
  })

  socket.on("remoteDescription", (params) => {
    console.log("remote description")
    let roomId = users[socket.id].roomId;    
    let otherUsers = rooms[roomId].users;

    otherUsers.forEach(otherUser => {
      if (otherUser !== socket.id) {
        io.to(otherUser).emit("remoteDescription", {
            description: params.description
        })
      }
    })
  });

  socket.on("iceCandidate", (params) => {
    console.log("ice candidate")
    let roomId = users[socket.id].roomId;    
    let otherUsers = rooms[roomId].users;
    otherUsers.forEach(otherUser => {
      if (otherUser !== socket.id) {
        io.to(otherUser).emit("iceCandidate", {
          candidate: params.candidate
        })
      }
    })
  });


  socket.on("iceCandidateReply", (params) => {
    console.log("ice candidate reply")
    let roomId = users[socket.id].roomId;    
    let otherUsers = rooms[roomId].users;

    otherUsers.forEach(otherUser => {
      if (otherUser !== socket.id) {
        io.to(otherUser).emit("iceCandidateReply", {
          candidate: params.candidate
        })
      }
    })
  });

});

server.listen(3002, () => {
  console.log('listening on 3002');
});
