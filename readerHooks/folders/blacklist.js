(function() {

	var blacklist = {
		process: function(folder, config, callback) {
			if(config.blacklist) {
				var len = folder.content.length;
				var c = [];
				while(len--) {
					if(~config.blacklist.indexOf(folder.content[len].name)) {
						continue;
					}
					c.unshift(folder.content[len]);
				}
				folder.content = c;
			}
			callback(null, folder);
		}
	};
	
	module.exports = exports = blacklist;
}());
