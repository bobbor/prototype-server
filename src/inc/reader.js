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
		'video/mp4': ['mp4', 'm4v', 'mov'],
		'video/webm': ['webm']
	});

	var handleDirectory = function(path, config, referer, callback) {
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
			u.lazyEach({
				entity: activeHooks.folders,
				step: function(data) {
					data.item.process(folder, function(err, newFolder) {
						if(err) {
							callback(err);
						}
						folder = newFolder;
						data.complete();
					});
				},
				complete: function() {
					callback(null, false, folder);
				}
			});
		});
	};

	var handleFile = function(path, config, referer, callback) {
		fs.readFile(path, function(err, data) {
			if(err) {
				callback(err);
				return;
			}
			var folders = path.split('/');

			var file = {
				path: path,
				referer: referer,
				config: config,
				name: folders[folders.length-1],
				type: mime.lookup(path),
				data: data
			};

			u.lazyEach({
				entity: activeHooks.files,
				step: function(data) {
					data.item.process(file, function(err, newFile) {
						file = newFile;
						data.complete();
					});
				},
				complete: function() {
					callback(null, true, file);
				}
			});
		});
	}

	var reader = {
		addFolderHook: function(name) {
			var names = name.split(' ');
			names.forEach(function(name) {
				if(_.keys(activeHooks.folders).indexOf(name) !== -1) {return;}
				else {
					activeHooks.folders[name] = require('../../readerHooks/folders/'+name+'.js');
				}
			});
		},
		addFileHook: function(name) {
			if(_.keys(activeHooks.files).indexOf(name) !== -1) {return;}
			else {
				activeHooks.files[name] = require('../../readerHooks/files/'+name+'.js');
			}
		},
		read: function(path, config, referer, callback) {
			fs.stat(path, function(err, stats) {
				if(err) {
					callback(err);
					return;
				}
				if(stats.isDirectory()) {
					handleDirectory(path, config, referer, callback);
				} else if(stats.isFile()) {
					handleFile(path, config, referer, callback);
				}
			});
		}
	};

	module.exports = exports = reader;
}());
