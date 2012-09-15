(function() {

	var express = require('express');
	var _ = require('underscore');
	var fs = require('fs');
	var reader = require('./inc/files');
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
			
			var postProcess = function(data) {
				var 
					temp1 = [],
					temp2 = [],
					len = data.length
				;
				
				if(config.blacklist) {
					while(len--) {
						if(config.blacklist.indexOf(data[len].name) !== -1) {
							data.remove(len);
						}
					}
				}
				
				if(config.foldersFirst) {
					data.forEach(function(item) {
						if(item.type === 'folder') {
							temp1.push(item);
						} else {
							temp2.push(item);
						}
					});
				}
				
				return temp1.concat(temp2);
			};
			
			app.use(express.bodyParser());
			app.use(express.methodOverride());
			
			app.use(express.static(__dirname+'/public', {maxAge: 1000*60*5}));
			app.use(app.router);
			
			app.set('view engine', 'jade');
			
			app.engine('jade', require('jade').__express);
			
			app.get('/favicon.ico', function(req, res, next) {
				res.send(200);
			});
			
			app.get('/*', function(req, res, next) {
				var path = req.params[0].split('/');
				var current = path[path.length-1];
				
				reader.read(config.docroot+req.params[0], function(err, file, data) {
					if(err) {
						res.send(404);
					} else if(file) {
						res.type(data.type);
						res.send(data.data);
					} else {
						if(current !== '') {
							res.redirect(req.params[0]+'/');
							return;
						}
						
						data = postProcess(data);
						if(req.params[0]) {
							data.unshift({
								name: 'Up one dir',
								size: '0 B',
								modified: ' - ',
								modifiedNice: ' - ',
								type: 'folder',
								classNames: 'type-folder',
								link: './../'
							});
						}
						
						res.render('index', {
							gotoIndex: config.gotoIndex &&
										data.reduce(function(prev, item) {
											return prev || (item.name === 'index.html');
										}, false),
							content: data,
							folder: req.params[0] ? req.params[0] : 'root'
						}, function(err, html) {
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
					console.log('can\'t read config');
					process.exit();
				}
				config = JSON.parse(data);
				
				var server = http.createServer(app)
					.on('error', function(err) {
						console.log('error with port '+port+'. trying '+fallbackPort);
						if(port === desiredPort) {
							port = fallbackPort; server.listen(port);
						}
					})
					.on('listening', function() {
						console.log('success. listening on Port '+port);
					})
					.listen(port);
			});
		}
	};
	
	module.exports = exports = server;
}());