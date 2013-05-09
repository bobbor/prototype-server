(function() {

	var blacklist = {
		process: function(folder, callback) {
			if(folder.config.blacklist) {
				var len = folder.files.length;
				while(len--) {
					if(folder.config.blacklist.indexOf(folder.files[len].name) !== -1) {
						folder.files.remove(len);
					}
				}
			}
			callback(null, folder);
		}
	};
	
	module.exports = exports = blacklist;
}());
