var channel = require('./node-channel');

var express = require('express');

var server = express.createServer();

channel.listen(server);

var token = channel.getToken("122222");

server.get('/', function(req, res) {
	res.header("Content-Type", "text/html; charset=utf-8");
	var id = channel.getToken("122222");
	res.write("hello this" + id);
	res.end();
});

setInterval(function() {
	channel.send(token, "hello world");
},
1000);

server.listen(8080);

