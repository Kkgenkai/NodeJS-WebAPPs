const express = require("express");
const { createServer } = require('node:http');
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;
const app = express();
app.set("view engine", "ejs");
app.use('/static', express.static(__dirname + "/views/public"));

const server = createServer(app);
const io = new Server(server, {

});

app.get('/', (req, res) => {
  res.render("XO");
});

server.listen(3000, () => {
  console.log(`server running at http://localhost:${PORT}`);
});



let connectedSockets = [];
let waitingPlayers = [];
let matchedPlayers = [];

io.on('connection', socket=>{
  connectedSockets.push(socket.id);

  socket.emit('yourID', socket.id);
  io.emit('numberOfUsersConnected', io.engine.clientsCount);
  io.emit('ListOfUsers', {connectedSockets});
  io.emit('OnGoingMatches', matchedPlayers.map(match=>{ return {playerA: match.playerA.id, playerB: match.playerB.id} }));

  if (waitingPlayers.length > 0) {
    const opponent = waitingPlayers.pop();

    let randomFirst = (Math.floor(Math.random() * 2)) + 1;
    socket.emit('matchFound', { opponentId: opponent.id, player: 1 , randomFirst});
    opponent.emit('matchFound', { opponentId: socket.id, player: 2 , randomFirst});

    matchedPlayers.push({
      playerA: socket, 
      playerB: opponent
    });

  } else {
    waitingPlayers.push(socket);
  }



  socket.on("playerDone", data=>{
    let reqPlayers = matchedPlayers.filter(match => match.playerA.id === socket.id || match.playerB.id === socket.id);
    let playerA = reqPlayers[0].playerA;
    let playerB = reqPlayers[0].playerB;


    if(data.player === 1){
      playerB.emit("OtherPlayerDone", data.boardHTML);
    }else{
      playerA.emit("OtherPlayerDone", data.boardHTML);
    }
  });

  socket.on("winner", data=>{
    let randomFirst = (Math.floor(Math.random() * 2)) + 1;

    let reqPlayers = matchedPlayers.filter(match => match.playerA.id === socket.id || match.playerB.id === socket.id);
    let playerA = reqPlayers[0].playerA;
    let playerB = reqPlayers[0].playerB;

    playerA.emit("winnerFound", {data, randomFirst});
    playerB.emit("winnerFound", {data, randomFirst});
  })

  socket.on('disconnect', () => {
    connectedSockets = connectedSockets.filter(id => id !== socket.id);
    const index = waitingPlayers.indexOf(socket);
    if (index !== -1) {
      waitingPlayers.splice(index, 1);
    }

    matchedPlayers.forEach(match=>{
      if(match.playerA.id === socket.id){
        match.playerB.emit("opponentDisc", `Opponent Player X (User ${socket.id.slice(0, 7)}) Disconnected Find Another Match ? [Cancel => Exit/RickRolled]`);
      }else if(match.playerB.id === socket.id){
        match.playerA.emit("opponentDisc", `Opponent Player O (User ${socket.id.slice(0, 7)}) Disconnected Find Another Match ? [Cancel => Exit/RickRolled]`);
      }
    })
    matchedPlayers = matchedPlayers.filter(match => match.playerA.id !== socket.id || match.playerB.id !== socket.id);

    let disId = socket.id;
    io.emit('numberOfUsersConnected', io.engine.clientsCount);
    io.emit('ListOfUsers', {connectedSockets, disId});
    io.emit('OnGoingMatches', matchedPlayers.map(match=>{ return {playerA: match.playerA.id, playerB: match.playerB.id} }));
  });
});
