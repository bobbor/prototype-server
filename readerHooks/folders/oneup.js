(function() {
	var oneup = {
		process: function(folder, config, callback) {
			if(folder.path !== config.docroot) {
				folder.content.unshift({
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