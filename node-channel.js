/*
 * Channel API for expressjs
 *
 *
 */

var express = require('express');

var tokens = {};
var __channel = null;
var channel = {};
var messages = {};

var Channel = function() {};

Channel.prototype.listen = function(server) {
	this._server = server;
	this._server.get('/__channel/:channel_id', this.onRequest);
	this._server.use('/node-channel', express.static(__dirname + '/frontjs'));
};

Channel.prototype.removeResponse = function(id, res) {
	var reses = tokens[id];
	for (var i = 0; i < reses.length; i++) {
		if (reses[i] === res) {
			reses.splice(i, 1);
		}
	};
};

Channel.prototype.onRequest = function(req, res) {
	var id = req.params.channel_id;
	console.log('incoming channel_id' + id);
	if (__channel.check(id)) {
		tokens[id].push(res);
    for(var i = 0; i < messages[id].length; i++) {
      __channel.send(id, messages[id][i]);
    };
    __channel.send(id, "", true);
		res.on('close', function() {
			__channel.removeResponse(id, res);
		});
	} else {
		res.end();
	};
};

Channel.prototype.check = function(id) {
	if (typeof tokens[id] === 'undefined') {
		return false;
	}
	return true;
};

Channel.prototype.getToken = function(str) {
  var id = this.md5(str);
  this.create(id);
  return id;
};

Channel.prototype.md5 = function(str) {
	var crypto = require('crypto');
	return crypto.createHash('md5').update(str).digest('hex');
};

Channel.prototype.create = function(id) {
	if (typeof tokens[id] === 'undefined') {
		tokens[id] = [];
    messages[id] = [];
	}
};

Channel.prototype.send = function(id, message, end) {
  var end = end || false;
	if (this.check(id)) {
    if (tokens[id].length === 0) {
      if (typeof messages[id] === 'undefined') {
        messages[id] = [];
      }
      messages[id].push(message);
      return;
    }
		for (var i = 0; i < tokens[id].length; i++) {
			var res = tokens[id][i];
			res.write(message);
      if (end) {
        tokens[id].splice(i, 1);
        res.end();
      }
		};
	}
};


var getChannel = function(server) {
	if (!__channel) {
		__channel = new Channel(server);
	}
	return __channel;
};

exports.listen = function(server) {
	var c = getChannel(server);
	c.listen(server);
}

exports.getToken = function(str) {
  if (__channel) {
    return __channel.getToken(str);
  }
  return null;
};

exports.send = function(id, msg, end) {
  if (__channel) {
    __channel.send(id, msg, end);
  }
}

