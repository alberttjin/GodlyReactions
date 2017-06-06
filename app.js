var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server, {});
server.listen(2000);

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/Client/index.html');
})
app.use('client', express.static(__dirname + '/Client'));
console.log("finding clients");

io.sockets.on('connection', function(socket) {
  console.log("Someone joined!");
});
