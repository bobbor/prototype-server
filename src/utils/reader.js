var async = require('async');
var fs = require('fs');
var mime = require('mime');
var path = require('path');
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

module.exports = (function() {
	var sep = path.sep;
	function resolve(p, config) {
		return path.resolve(config.docroot, './'+p);
	};

	function handleDirectory(_path, config, callback) {
		fs.readdir(_path, function(err, files) {
			if(err) {
				callback(err, null);
				return;
			}

			// preparing the filesArray for the hooks
			var folder = {
				isFile: false,
				isFolder: true,
				path: _path,
				name: _path.split(path.sep).pop(),
				content: files.map(function(file) {
					return {
						name: file
					};
				})
			};

			// let every hook process the folder
			async.eachSeries(_.keys(activeHooks.folders), function(hook, done) {
				activeHooks.folders[hook].process(folder, config, function(err, data) {
					if(err) { done(err); }
					folder = data;
					done();
				});
			}, function() {
				callback(null, folder);
			});
		});
	};

	function handleFile(_path, config, callback) {
		fs.readFile(_path, function(err, content) {
			if(err) {
				callback(err, null);
				return;
			}

			// preparing the filesArray for the hooks
			var file = {
				isFile: true,
				isFolder: false,
				path: _path,
				name: _path.split(path.sep).pop(),
				content: content
			};
			file.type = mime.lookup(file.name);

			// let every hook process the folder
			async.eachSeries(_.keys(activeHooks.files), function(hook, done) {
				activeHooks.files[hook].process(file, config, function(err, data) {
					if(err) { done(err); }
					file = data;
					done();
				});
			}, function() {
				callback(null, file);
			});
		});
	};

	return {
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
		read: function(_path, config, callback) {
			_path = resolve(_path, config);
			fs.stat(_path, function(err, stats) {
				if(err) {
					callback(err, null);
					return;
				}
				if(stats.isDirectory()) {
					handleDirectory(_path, config, callback);
				} else if(stats.isFile()) {
					handleFile(_path, config, callback);
				}
			});
		}
	}
}());