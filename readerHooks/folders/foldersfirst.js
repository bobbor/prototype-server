(function() {

	var foldersFirst = {
		process: function(folder, config, callback) {
			var temp1 = [], temp2 = [];
			var len = folder.content.length;
			
			folder.content.forEach(function(file) {
				if(file.type === 'folder') {
					temp1.push(file);
				} else {
					temp2.push(file);
				}
			});
			
			folder.content = temp1.concat(temp2);
			callback(null, folder);
		}
	};
	
	module.exports = exports = foldersFirst;
}());