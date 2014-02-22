(function() {

	var packer = {
		process: function(folder, config, callback) {
			folder.packable = folder.content.reduce(function(prev, file) {
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