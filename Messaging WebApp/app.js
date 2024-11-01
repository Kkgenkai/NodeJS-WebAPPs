const express = require("express");
const { createServer } = require('node:http');
const { Server } = require("socket.io");

const app = express();
app.set("view engine", "ejs");

const server = createServer(app);
const io = new Server(server, {

});


app.get('/', (req, res) => {
  res.render("chat");
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});





let generalDB = [];
let individualDB = []; //Structure Below
/*individualDB = [
  {
    id: thisUser.socket.id + theOtherSpecificUser.socket.id || theOtherSpecificUser.socket.id + thisUser.socket.id,
    messages: ["Message1", "Message2", "Message3"]
  }
] 
*/
let connectedSockets = [];


io.on('connection', socket=>{
  let currentOtherUser = null; //Since By Default When Connecting To Server Get Added To #General

  connectedSockets.push(socket.id);
  socket.emit('yourID', socket.id);
  io.emit('numberOfUsersConnected', io.engine.clientsCount);
  io.emit('ListOfUsers', {connectedSockets});

  //To Edit
  socket.on('message', data=>{
    if(data.isGeneral){
      generalDB.push(data.message);
      io.emit('general', data.message);
    }else if(!data.isGeneral){
      //Handle Individual Data
      let indMsgId = socket.id + currentOtherUser || currentOtherUser + socket.id;
      let found = false;
      const targetSocket = io.sockets.sockets.get(currentOtherUser);

      individualDB.forEach(document=>{
        if(document.id === indMsgId){
          found = true;
          document.message.push(data.message);

          targetSocket.emit('individual', data.message);
          socket.emit('individual', data.message);
        }
      });

      if(!found){
        individualDB.push({
          id: indMsgId,
          message: [data.message]
        });
        
        targetSocket.emit('individual', data.message);
        socket.emit('individual', data.message);
      }
    }
  });

  socket.on('#General', msg=>{
    socket.emit('generalChosen', {generalDB});
  });

  socket.on('#Individual', userID=>{
    currentOtherUser = userID;

    let indMsgId = socket.id + currentOtherUser || currentOtherUser + socket.id;
    individualDB.forEach(document=>{
      if(document.id === indMsgId){
        socket.emit('IndividualChosen', document);
      }
    });

    // if(!found){
    //   individualDB.push({
    //     id: indMsgId,
    //     message: [data.message]
    //   });
    //   targetSocket.emit('IndividualChosen', document.message);
    //   socket.emit('IndividualChosen', data.message);
    // }
  });




  socket.on('disconnect', () => {
    let disId = socket.id;
    connectedSockets = connectedSockets.filter(id => id !== socket.id);
    io.emit('numberOfUsersConnected', io.engine.clientsCount);
    io.emit('ListOfUsers', {connectedSockets, disId});
  });  
});

