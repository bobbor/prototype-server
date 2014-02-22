(function() {
	var EventEmitter = require('events').EventEmitter;
	var express = require('express');

	var async = require('async');
	var fs = require('fs');
	var colors = require('colors');

	var reporter = require('./utils').reporter;
	var reader = require('./utils').reader;

	var http = require('http');
	var path = require('path');

	var cons = require('consolidate');
	var Handlebars = require('handlebars');


	var Server = function() {
		var app = express();
		
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express['static'](__dirname+'/../views/public', {maxAge: 1000*60*5}));
		app.use(app.router);
		
		app.engine('handlebars', cons.handlebars);
		app.set('view engine', 'handlebars');
		app.set('views', __dirname+'/../views/');

		app.get('favicon.ico', function(req, res, next) {
			res.send(__dirname+'/../views/public/favicon.ico');
		});
		app.get('apple-touch-icon.png', function(req, res, next) {
			res.send(__dirname+'/../views/public/fav64.png');
		});

		this.app = app;
		this.config = this.readConfig();
	};
	Server.prototype = new EventEmitter();
	Server.prototype.constructor = Server;
	Server.prototype.readConfig = function() {
		var configFile = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + path.sep + '.prototype-server.config';
		var config;

		try {
			config = fs.readFileSync(configFile, 'utf-8');
		} catch(o_O) {
			if(o_O.code === 'ENOENT') {
				try {
					config = fs.readFileSync(__dirname+'/../config/config.json','utf-8');
				} catch(o_O) {
					if(o_O.code === 'ENOENT') {
						console.log('can\'t read config'.red);
					}
					process.exit();
				}
				fs.writeFileSync(configFile, config, 'utf-8');
			}
		}
		try {
			config = JSON.parse(config);
		} catch(o_O) {
			console.log('config is no valid JSON'.red);
			process.exit();
		}
		return config;
	};
	Server.prototype.routes = function() {
		var app = this.app;
		var config = this.config;

		app.all('/*', function(req, res, next) {
			reader.read(req.params[0], config, function(err, data) {
				if(err) {
					res.send(404);
					return;
				}
				if(data.isFolder) {
					res.render('index', data, function(err, html) {
						if(err) { throw err; }
						res.type('text/html');
						res.send(html);
						reporter.req(req, res);
					});
					return;
				}
				if(data.isFile) {
					var suffix = data.type.split('/');
					suffix = suffix[0];
					if(suffix === 'video') {
						res.header('Content-Range', 'bytes 0-'+(data.content.length-1)+'/'+(data.content.length));
						res.status(200);
					}
					res.header('Content-Type', data.type+'; charset=utf-8');
					res.send(data.content);
					reporter.req(req, res);
				}
			});
		});
	};

	Server.prototype.setupHooks = function() {
		var config = this.config;
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
	};

	Server.prototype.registerPartials = function() {
		// Register partials
		var partials = "./views/partials/";
		fs.readdirSync(partials).forEach(function (file) {
			var source = fs.readFileSync(partials + file, "utf8"),
				partial = /(.+)\.handlebars/.exec(file).pop();
			Handlebars.registerPartial(partial, source);
		})
	};

	Server.prototype.startup = function() {
		var app = this.app;
		var config = this.config;

		this.routes();
		this.setupHooks();
		this.registerPartials();

		var server = http.createServer(app)
			.on('error', function(err) {
				console.log('error'.red)
			})
			.on('listening', function() {
				console.log(('listening on '+config.port+'').blue)
			})
			.listen(config.port);
	};
	module.exports = new Server();
}());
