/*
	this hook extends the default information about a file inside a folder,
	which are very .. ahem.. sucky, with its stat information 
*/

(function() {
	var mime = require('mime');
	var fs = require('fs');
	var async = require('async');
	var utils = require('./lib/utils.js');
	
	var hook = {
		process: function(folder, config, callback) {
			var _path = folder.path;
			async.each(folder.content, function(file, done) {
				fs.stat(_path+'/'+file.name, function(err, stats) {
					if(err) { done(err); return; }
					
					file.size = utils.humanReadable.size(stats.size);
					file.modified = stats.mtime;
					file.modifiedNice = utils.humanReadable.time(stats.mtime);
					file.type = stats.isDirectory() ? 'folder' : stats.isFile() ? mime.lookup(file.name) : 'generic';
					file.classNames = utils.shortifyMIMEs(file.type);
					file.link = './'+file.name + (file.type === 'folder' ? '/' : '');
					done();
				});
			}, function(err) {
				if(err) {
					callback(err, null);
					return;
				}
				callback(null, folder)
			});
		}
	};
	module.exports = exports = hook;
}());
