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
  res.sendFile(__dirname + '/Client/index.html');
});

app.use('/', express.static(__dirname + '/Client'));
console.log('finding clients');

io.sockets.on('connection', function(socket) {
    var roomNum;
    console.log('joined');
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
    console.log('added to room');
    socket.on('angle', function(data) {
      socket.broadcast.to(roomNum.toString()).emit('updateAngle', data);
    })
    socket.on('updateChar', function(data) {
      console.log("lol");
      socket.broadcast.to(roomNum.toString()).emit('updateEnemyChar', data);
    })
    socket.on('updateAttack', function(data) {
      socket.broadcast.to(roomNum.toString()).emit('updateEnemyAttack', data);
    })
    socket.on('disconnect', function() {
      rooms[roomNum] -= 1;
    })
  });
