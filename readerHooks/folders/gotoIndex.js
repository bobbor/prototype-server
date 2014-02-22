(function() {
	var index = {
		process: function(folder, config, callback) {
			folder.gotoIndex = folder.content.reduce(function(prev, file) {
				return prev || file.name === 'index.html';
			}, false);
			callback(null, folder);
		}
	};
	
	module.exports = exports = index;
}());