(function() {

	var packer = {
		process: function(folder, callback) {
			folder.packable = folder.files.reduce(function(prev, file) {
				if(prev) { return prev; }
				if(file.type === 'folder') { return prev; }
				var ext = file.name.replace(/.*[\.\/]/, '').toLowerCase();
				return (ext === 'jspackconfig' || ext === 'jspackcfg');
			}, false);
			callback(null, folder);
		}
	};
	
	module.exports = exports = packer;
}());