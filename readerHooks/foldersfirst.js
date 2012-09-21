(function() {

	var foldersFirst = {
		process: function(folder, callback) {
			var temp1 = [], temp2 = [];
			var len = folder.files.length;
			
			folder.files.forEach(function(file) {
				if(file.type === 'folder') {
					temp1.push(file);
				} else {
					temp2.push(file);
				}
			});
			
			folder.files = temp1.concat(temp2);
			callback(null, folder);
		}
	};
	
	module.exports = exports = foldersFirst;
}());