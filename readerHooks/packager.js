(function() {
	var mime = require('mime');
	var packager = {
		process: function(file, callback) {
			var ext = file.name.replace(/.*[\.\/]/, '').toLowerCase();
			if(ext === 'jspackconfig' || ext === 'jspackcfg') {
				file.type = mime.types['json'];
			}
			callback(null, file);
		}
	};
	
	module.exports = exports = packager;
}());