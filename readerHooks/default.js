(function() {
	var u = require('../inc/utils.js');
	var mime = require('mime');
	var fs = require('fs');
	
	var hook = {
		process: function(folder, callback) {
			var path = folder.path;
			u.lazyMapArray(folder.files, function(file, idx, allFiles, resultCallback) {
				fs.stat(path+'/'+file.name, function(err, stats) {
					if(err) {
						callback(err);
						return;
					}
					file.size = u.humanReadable.size(stats.size);
					file.modified = stats.mtime;
					file.modifiedNice = u.humanReadable.time(stats.mtime);
					file.type = stats.isDirectory() ? 'folder' : stats.isFile() ? mime.lookup(file.name) : 'generic';
					file.classNames = u.shortifyMIMEs(file.type);
					file.link = './'+file.name+(file.type === 'folder' ? '/' : '');
					
					resultCallback(file);
				});
			}, function(map) {
				folder.files = map;
				callback(null, folder);
			});
		}
	}
	module.exports = exports = hook;
}());
