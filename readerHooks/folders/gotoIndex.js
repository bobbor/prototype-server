(function() {
	var index = {
		process: function(folder, callback) {
			folder.gotoIndex = folder.files.reduce(function(prev, file) {
				return prev || file.name === 'index.html';
			}, false);
			callback(null, folder);
		}
	};
	
	module.exports = exports = index;
}());