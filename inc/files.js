(function() {
	var fs = require('fs');
	var mime = require('mime');
	
	mime.define({
		'application/x-gzip': ['gz', 'tgz'],
		'image/xcf': ['xcf'],
		'text/php': ['php'],
		'text/batch': ['bat', 'cmd'],
		'text/ruby': ['rb'],
		'text/css': ['scss', 'sass', 'less', 'lcss']
	});
	
	var lazyMapArray = function(arr, stepFn, completeFn) {
		result = [];
		var iterator = function(temp) {
			if(!temp.length) {
				completeFn(result);
				return;
			}
			item = temp.shift();
			
			stepFn(item, function(mappedItem) {
				result.push(mappedItem);
				iterator(temp);
			});
		};
		
		iterator(arr);
	}
	
	var humanReadable = {
		size: function(size) {
			var suffixes = [' B', ' K', ' M', ' G', ' T'];
			var idx = 0;
			var iterator = function(size) {
				var nextStep = ((size / 1024)|0);
				if(!nextStep) {
					return size + suffixes[idx];
				}
				idx++;
				return iterator(nextStep);
			}
			return iterator(size);
		},
		time: function(timestamp) {
			var diff = (+(new Date())) - timestamp.getTime();
			var current = {
				single: ' second',
				multi: ' seconds'
			};
			var idx = -1;
			var steps = [{
					split: 60,
					single: ' minute',
					multi: ' minutes'
				}, {
					split: 60,
					single: ' hour',
					multi: ' hours'
				}, {
					split: 24,
					single: ' day',
					multi: ' days'
				}, {
					split: 30,
					single: ' month',
					multi: ' months'
				},{
					split: 12,
					single: ' year',
					multi: ' years'
				}];
			var iterator = function(time) {
				if(!steps[idx+1]) {
					return time+(time !== 1 ? current.multi : current.single);
				}
				var newTime = (time/steps[idx+1].split)|0;
				if(!newTime) {
					return time+(time !== 1 ? current.multi : current.single);
				}
				idx++;
				current = steps[idx];
				return iterator(newTime);
			}
			
			if(diff < 1000) {
				return 'less than a second ago';
			}
			diff = (diff/1000)|0;
			return iterator(diff)+' ago';
		}
	};
	
	var shortify = function(type) {
		if(type === 'folder') {
			return 'type-folder';
		} else if(type === 'generic') {
			return 'type-generic';
		} else {
			var names = type.split('/');
			if(names[1].indexOf('-') !== -1) {
				names[1] = names[1].split('-')[1];
			}
			return names.map(function(item, i) {
				return 'type-'+item.replace(/\./gi, '_');
			}).join(' ');
		}
	};
	var reader = {
		read: function(path, callback) {
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
						
						lazyMapArray(files, function(item, resultCallback) {
							var map = {
								name: item
							};
							fs.stat(path+'/'+item, function(err, itemStats) {
								if(err) {
									callback(err);
									return;
								}
								map.size = humanReadable.size(itemStats.size);
								map.modified = itemStats.mtime;
								map.modifiedNice = humanReadable.time(itemStats.mtime);
								map.type = itemStats.isDirectory() ? 'folder' : itemStats.isFile() ? mime.lookup(item) : 'generic';
								map.classNames = shortify(map.type);
								map.link = './'+item+(map.type === 'folder' ? '/' : '');
								
								resultCallback(map);
							});
						}, function(map) {
							callback(null, false, map);
						});
					});
					
				} else if(stats.isFile()) {
					fs.readFile(path, function(err, data) {
						if(err) {
							callback(err);
							return;
						}
						callback(null, true, {
							type: mime.lookup(path),
							data: data
						});
					});
				}
			});
		}
	};
	
	module.exports = exports = reader;
}());