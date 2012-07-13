var fs = require('fs');
var express = require('express');
var cwd = process.cwd();
var mime = require('mime');

var server = {
	version: '0.1.0',
	init: function(folder) {
		var app = express.createServer();
		
		app.get('/', function(req, res) {
			fs.readdir(folder, function(err, files) {
				var html = '<ul>';
				for(var i = 0, len = files.length; i < len; i++) {
					html += '<li><a href="'+files[i]+'/">'+files[i]+'</a></li>'
				}
				res.send(html+'</ul>');
			});
		});
		
		app.get('/*', function(req, res) {
			req.url = decodeURIComponent(req.url);
			fs.stat(folder+req.url, function(err, stat) {
				if(err) {
					res.send(404);
					return;
				}
				if(stat.isDirectory()) {
					if(req.url.lastIndexOf('/') !== req.url.length-1) {
						res.redirect(req.url+'/');
						return;
					}
					fs.readdir(folder+req.url, function(err, files) {
						var html = '<ul>';
						html += '<li><a href="../">../</a></li>'
						for(var i = 0, len = files.length; i < len; i++) {
							html += '<li><a href="'+files[i]+'/">'+files[i]+'</a></li>'
						}
						res.send(html+'</ul>');
					});
				} else {
					var url = folder+req.url;
					if(url.lastIndexOf('/') === url.length-1) {
						res.redirect(req.url.substring(0, req.url.lastIndexOf('/')));
						return;
					}
					fs.readFile(url, function(err, data) {
						if(err) {
							res.send(404);
							return;
						}
						var type = mime.lookup(url, 'application/octet-stream');
						res.contentType(type);
						res.send(data);
					});
				}
			});
		});
		
		app.listen(80);
		console.log('listening on port 80');
	}
};

module.exports = server;