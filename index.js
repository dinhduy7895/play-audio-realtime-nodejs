var express = require('express'),app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3030;
var socketIdList = [];
var currentTime = 0 ;
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
 
io.on('connection', function(socket){
	console.log('connected');

	socketIdList.splice(0,0,socket.id);
	if(socketIdList.length > 1){
		var lateSocketId = socketIdList[socketIdList.length-1];
		io.to(lateSocketId).emit('getCurrentTime');
	}

	socket.on('getCurrentTime', function(data){
		io.to(socketIdList[0]).emit('setCurrentTime', data);
	});

	socket.on('play', function(){
		socket.broadcast.emit('play');
	});

	socket.on('pause', function(){
		socket.broadcast.emit('pause');
	});

	socket.on('mute', function(){
		socket.broadcast.emit('mute');
	});

	socket.on('muted', function(){
		socket.broadcast.emit('muted');
	});

	socket.on('change', function(data){
		socket.broadcast.emit('change', data);
	});

	socket.on('volume', function(data){
		socket.broadcast.emit('volume', data);
	});
	socket.on('disconnect', function(){
		var index = socketIdList.indexOf(socket.id);
		socketIdList.splice(index,1);
		console.log('dissconnect');
	})
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});