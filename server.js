var channel = require('./node-channel');

var express = require('express');

var server = express.createServer();

channel.listen(server);

server.listen(8080);

