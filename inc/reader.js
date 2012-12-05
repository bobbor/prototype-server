(function() {
	var fs = require('fs');
	var mime = require('mime');
	var u = require('./utils');
	var _ = require('underscore');
	var activeHooks = {
		folders: {},
		files: {}
	};
	
	mime.define({
		'application/x-gzip': ['gz', 'tgz'],
		'image/xcf': ['xcf'],
		'text/php': ['php'],
		'text/batch': ['bat', 'cmd'],
		'text/ruby': ['rb'],
		'text/css': ['scss', 'sass', 'less', 'lcss'],
		'text/vtt': ['vtt'],
		'video/x-m4v': ['m4v'],
		'video/mp4': ['mp4'],
		'video/webm': ['webm']
	});
	
	var reader = {
		addFolderHook: function(name) {
			var names = name.split(' ');
			names.forEach(function(name) {
				if(_.keys(activeHooks.folders).indexOf(name) !== -1) {return;}
				else {
					activeHooks.folders[name] = require('../readerHooks/'+name+'.js');
				}
			});
		},
		addFileHook: function(name) {
			if(_.keys(activeHooks.files).indexOf(name) !== -1) {return;}
			else {
				activeHooks.files[name] = require('../readerHooks/'+name+'.js');
			}
		},
		read: function(path, config, callback) {
			fs.stat(path, function(err, stats) {
				if(err) {
					callback(err);
					return;
				}
				if(stats.isDirectory()) {
					fs.readdir(path, function(err, files) {
						if(err) {
							callback(err);
							return;
						}
						
						// preparing the filesArray for the hooks
						var folder = {
							path: path,
							config: config,
							files: files.map(function(file) {
								return {name: file};
							})
						};
						u.lazyEach(activeHooks.folders, function(hook, name, hooks, next) {
							hook.process(folder, function(err, newFolder) {
								if(err) {
									callback(err);
								}
								folder = newFolder;
								next();
							});
						}, function() {
							callback(null, false, folder);
						});
					});
					
				} else if(stats.isFile()) {
					fs.readFile(path, function(err, data) {
						if(err) {
							callback(err);
							return;
						}
						var folders = path.split('/');
						var system = folders.shift();
						folders = system.split('\\').concat(folders);
						
						var file = {
							path: folders,
							name: folders[folders.length-1],
							type: mime.lookup(path),
							data: data
						};
						
						u.lazyEach(activeHooks.files, function(hook, name, hooks, next) {
							hook.process(file, function(err, newFile) {
								file = newFile;
								next();
							});
						}, function() {
							callback(null, true, file);
						});
					});
				}
			});
		}
	};
	
	module.exports = exports = reader;
}());
