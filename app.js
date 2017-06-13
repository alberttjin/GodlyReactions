var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {});
var rooms = [];

for (i = 0; i < 30; i++) {
  rooms.push(0);
}

server.listen(2000);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/Client/welcome.html');
});

app.get('/index', function(req, res) {
  res.sendFile(__dirname + '/Client/index.html');
});


app.use('/', express.static(__dirname + '/Client'));
console.log('finding clients');

io.sockets.on('connection', function(socket) {
    var roomNum;
    var username;
    //socket.on('username', function(data) {
      for (i = 0; i < rooms.length; i++) {
        if (rooms[i] < 2) {
          rooms[i] += 1;
          roomNum = i;
          socket.join(i.toString());
          if (rooms[i] == 1) {
            socket.emit("firstJoined");
          }
          if (rooms[i] == 2) {
            io.sockets.in(i.toString()).emit("start");
          }
          break;
        }
      }
    //});
    socket.on('lost', function(data) {
      socket.broadcast.to(roomNum.toString()).emit('won');
    });

    socket.on('username', function(data) {
      socket.broadcast.to(roomNum.toString()).emit('enemyUserName', data);
    });

    socket.on('health', function(data) {
      socket.broadcast.to(roomNum.toString()).emit('healthUpdate', data);
    });

    socket.on('damaged', function(data) {
      socket.broadcast.to(roomNum.toString()).emit('lowerHealth');
    });

    socket.on('angle', function(data) {
      socket.broadcast.to(roomNum.toString()).emit('updateAngle', data);
    });
    socket.on('updateChar', function(data) {
      socket.broadcast.to(roomNum.toString()).emit('updateEnemyChar', data);
    });
    socket.on('updateAttack', function(data) {
      socket.broadcast.to(roomNum.toString()).emit('updateEnemyAttack', data);
    });
    socket.on('disconnect', function() {
      console.log("disconnected");
      socket.broadcast.to(roomNum.toString()).emit('won');
      rooms[roomNum] -= 1;
    });
  });
