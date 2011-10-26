/*
 * Channel API for expressjs
 *
 *
 */

var express = require('express');

var tokens = {};
var __channel = null;
var channel = {};

var Channel = function() {};

Channel.prototype.listen = function(server) {
	this._server = server;
	this._server.get('/__channel/:channel_id', this.onRequest);
	//this._server.get('node-channel/:file', this.onStaticRequest);
  console.log(__dirname);
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
	if (__channel.checkID(id)) {
		tokens[id].push(res);
		res.on('close', function() {
			__channel.removeResponse(id, res);
		});
	} else {
		res.end();
	};
};

Channel.prototype.checkID = function(id) {
  console.log('check id');
  console.log(typeof tokens[id]);
  console.log(tokens[id]);
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
	}
};

Channel.prototype.sendMessage = function(id, message, end) {
  var end = end || false;
	if (this.checkID(id)) {
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
	console.log("inside get Channel");
	if (!__channel) {
		__channel = new Channel(server);
	}
	console.log("inside get Channel !");
	return __channel;
};

var createChannel = function() {

};

var destroyChannel = function(id) {};

var notifyChannel = function(id, msg) {};

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

exports.sendMessage = function(id, msg, end) {
  if (__channel) {
    __channel.sendMessage(id, msg, end);
  }
}

