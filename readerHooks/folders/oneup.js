(function() {
	var oneup = {
		process: function(folder, callback) {
			if(folder.path !== folder.config.docroot) {
				folder.files.unshift({
					name: 'Up one dir',
					type: 'folder',
					classNames: 'type-folder',
					link: './../'
				});
			}
			callback(null, folder);
		}
	};
	
	module.exports = exports = oneup;
}());