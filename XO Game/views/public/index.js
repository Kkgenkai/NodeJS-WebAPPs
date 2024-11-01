const socket = io();

let thisUsersID = null;
let users = $('#numOfUsers');
let thisUser = $('#thisUser');

let nav = $('.list');
let onGoingGames = $('#onGoingGames');
let listOfUsers = $('#ListOfUsers');

socket.on("yourID", data=>{
    thisUsersID = data;
    thisUser.text(`Your ID: ${thisUsersID.slice(0, 7)}`);
});

socket.on("numberOfUsersConnected", data=>{
    users.text(`Online Players: ${data}`);
});

socket.on('OnGoingMatches', matchs=>{
    onGoingGames.empty();
    matchs.forEach(match=>{
        const matchCont = document.createElement('div');
        const playerA = document.createElement('button');
        const playerB = document.createElement('button');
        const Vs = document.createElement('span');

        playerA.textContent = `P: ${match.playerA.slice(0, 7)}`;
        playerB.textContent =  `P: ${match.playerB.slice(0, 7)}`;
        Vs.textContent = " Vs ";

        playerA.setAttribute('disabled', true);
        playerB.setAttribute('disabled', true);
        matchCont.append(playerA);
        matchCont.append(Vs);
        matchCont.append(playerB);

        onGoingGames.append(matchCont);
    });
});

socket.on('ListOfUsers', data=>{
    data.connectedSockets.forEach(socketID =>{
        if(socketID !== thisUsersID && $('#' + socketID).length === 0){
            const user = document.createElement('button');
            user.setAttribute('id', socketID);
            user.setAttribute('style', 'display: block');
            user.textContent = `User: ${socketID.slice(0, 7)}`;
            listOfUsers.append(user);
        }
    })

    if(data.disId){
        $("#" + data.disId).remove();
    }
});



//Game Play Mechanics
let gInfo = $('div.gInfo > p');
let turn = $('div.turn > p');
$(".displayNone").toggleClass("XObox");
socket.on('matchFound', (data) => {
    $(".displayNone").toggleClass("XObox");
    
    gInfo.text(`You Vs ${data.opponentId.slice(0, 7)}`);
    let XObox = $('.XObox');
    let defaultXObox = XObox.html();

    const winningPatterns = [
        [0, 1, 2], // Top row
        [3, 4, 5], // Middle row
        [6, 7, 8], // Bottom row
        [0, 3, 6], // First column
        [1, 4, 7], // Second column
        [2, 5, 8], // Third column
        [0, 4, 8], // Diagonal from top-left
        [2, 4, 6]  // Diagonal from top-right
    ];
    
    let player = data.player;
    let thisPlayerMoved = false;
    let TNmoves = 0;

    randomTurn(data);

    socket.on("OtherPlayerDone", data=>{
        XObox.html(data);
        thisPlayerMoved = false;
        TNmoves++;
        if(TNmoves >= 5)
            winner();
    });

    socket.on("winnerFound", winner=>{
        gInfo.text(winner.data.msg);
        setTimeout(()=>{
            gInfo.text(`You Vs ${data.opponentId.slice(0, 7)}`);
        }, 1000);
        randomTurn(winner);
        TNmoves = 0;
        XObox.html(winner.data.defaultXObox);
    });

    socket.on("opponentDisc", msg=>{
        const confirmM = confirm(msg);
        if (confirmM) {
            location.reload();
        } else {
            location.reload();
        }
    })

    XObox.on('click', event=>{
        if(event.target.classList.contains('button')){
            //Change Text Content To X or O
            if(player === 1 && !thisPlayerMoved){
                event.target.textContent = 'X';
                let boardHTML = XObox.html();
                socket.emit("playerDone", {player, boardHTML});
                thisPlayerMoved = true;
            }else if(player === 2 && !thisPlayerMoved){
                event.target.textContent = 'O';
                let boardHTML = XObox.html();
                socket.emit("playerDone", {player, boardHTML});
                thisPlayerMoved = true;
            }

            TNmoves++;
            if(TNmoves >= 5)
                winner();
        }
    });

    function randomTurn(data){
       
        if(data.randomFirst === player){
            thisPlayerMoved = false;
            turn.text("Your First");
        }else if(data.randomFirst !== player){
            thisPlayerMoved = true;
            turn.text("Opponent's First");
        }
    }

    function winner(){
        let xoboxButtons = XObox.find(".button");
        let XOBArr = Array.from(xoboxButtons);
        let string = '';
        let str = '';
        let winner = false;

        XOBArr.forEach(btn=>{
            string += btn.textContent || ' ';
        });

        winningPatterns.forEach(pattern=>{
            if(!winner){
                pattern.forEach(element=>{
                    str += string[element];
                });

                if(str === 'XXX'){
                    let msg = "Player X Wins";
                    socket.emit("winner", {msg, defaultXObox});
                    winner = true;
                }else if(str === 'OOO'){
                    let msg = "Player O Wins";
                    socket.emit("winner", {msg, defaultXObox});
                    winner = true;
                }

                str = '';
            }
        });

        if(!winner && (string.indexOf(' ') === -1)){
            gInfo.text("Draw");
            setTimeout(()=>{
                gInfo.text(`You Vs ${data.opponentId.slice(0, 7)}`);
            }, 1000);
            randomTurn(winner);
            TNmoves = 0;
            XObox.html(defaultXObox);
        }
    }
});