/*
 * Channel API for expressjs
 *
 *
 */

var express = require('express');

var tokens = {};
var __channel = null;
var channel = null;

var Channel = function() {};

Channel.prototype.listen = function(server) {
	this._server = server;
	this._server.get('__channel/:channel_id', this.onRequest);
	//this._server.get('node-channel/:file', this.onStaticRequest);
  this._server.use(express.static(__dirname + '/node-channel'));
};

Channel.prototype.removeResponse = function(id, res) {
	var reses = tokens[id];
	for (var i = 0; i < reses.length; i++) {
		if (reses[i] === res) {
			reses.splice(i, 1);
		}
	};
};

Channel.prototype.onStaticRequest = function(req, res) {
  var file = req.params.file;
  if (file !== 'channel.js') {
    res.end();
    return;
  }
  
};

Channel.prototype.onRequest = function(req, res) {
	var id = req.params.channel_id;
	console.log('incoming channel_id');
	if (__channel.checkID(id)) {
		tokens[id].append(res);
		res.on('close', function() {
			__channel.removeResponse(id, res);
		});
	} else {
		res.end();
	};
};

Channel.prototype.checkID = function(id) {
	if (typeof tokens[id] !== 'undefined') {
		return false;
	}
	return true;
};

Channel.prototype.md5 = function(str) {
	var crypto = require('crypto');
	return crypto.createHash('md5').update(str).digest('hex');
};

Channel.prototype.init = function() {};

Channel.prototype.create = function(id) {
	if (typeof tokens[id] !== 'undefined') {
		tokens[id] = [];
	}
};

Channel.prototype.sendMessage = function(id, message) {
	if (this.checkID(id)) {
		for (var i = 0; i < tokens[id].length; i++) {
			var res = tokens[id][i];
			res.write(message);
		};
	}
};

var getChannel = function(server) {
	if (!__channel) {
		__channel = new Channel(server);
	}
	return __channel;
};

var createChannel = function() {

};

var destroyChannel = function(id) {};

var notifyChannel = function(id, msg) {};

exports = channel;

