(function() {

	var express = require('express');
	var _ = require('underscore');
	var fs = require('fs');
	var colors = require('colors');
	var reader = require('./inc/reader');
	var mime = require('mime');
	var http = require('http');

	Array.prototype.remove = function(from, to) {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	};

	var server = {
		create: function() {
			var app = express();
			var config;

			app.use(express.bodyParser());
			app.use(express.methodOverride());

			app.use(express['static'](__dirname+'/public', {maxAge: 1000*60*5}));
			app.use(app.router);
			app.set('view engine', 'jade');
			app.engine('jade', require('jade').__express);
			app.get('favicon.ico', function(req, res, next) {
				res.send(__dirname+'/public/favicon.ico');
			});
			app.get('apple-touch-icon.png', function(req, res, next) {
				res.send(__dirname+'/public/fav64.png');
			});


			app.get('/*', function(req, res, next) {
				var path = req.params[0].split('/');
				var current = path[path.length-1];

				reader.read(config.docroot+req.params[0], config, function(err, isFile, data) {
					if(err) {
						res.send(404);
					} else if(isFile) {
						var suffix = data.type.split('/');
						suffix = suffix[0];
						if(suffix === 'video') {
							res.header('Content-Range', 'bytes 0-'+(data.data.length-1)+'/'+(data.data.length));
							res.status(200);
						}
						res.header('Content-Type', data.type+'; charset=utf-8');
						res.send(data.data);
					} else {
						if(current !== '') {
							res.redirect(req.params[0]+'/');
							return;
						}
						data.folder = req.params[0] ? req.params[0] : 'root';
						res.render('index', data, function(err, html) {
							res.type('text/html');
							res.send(html);
						});
					}
				});
			});

			fs.readFile(__dirname+'/config/config.json','utf-8', function(err, data) {
				var desiredPort = 80;
				var fallbackPort = 9020;
				var port = desiredPort;
				if(err) {
					console.log('can\'t read config'.red);
					process.exit();
				}
				config = JSON.parse(data);
				if(config.hooks) {
					if(config.hooks.folders) {
						config.hooks.folders.forEach(function(hook) {
							reader.addFolderHook(hook);
						});
					}
					if(config.hooks.files) {
						config.hooks.files.forEach(function(hook) {
							reader.addFileHook(hook);
						});
					}
				}
				var server = http.createServer(app)
					.on('error', function(err) {
						process.send({
							cmd: 'state',
							state: true,
						});
						if(port === desiredPort) {
							port = fallbackPort; server.listen(port);
						}
					})
					.on('listening', function() {
						process.send({
							cmd: 'state',
							state: true,
							process: process.pid
						});
					})
					.listen(port);
			});

			// telling master cluster that fork is runnning
			setInterval(function() {
				process.send({
					cmd: "reportMem",
					memory: process.memoryUsage(),
					process: process.pid
				});
			}, 1000);
		}
	};

	module.exports = exports = server;
}());
