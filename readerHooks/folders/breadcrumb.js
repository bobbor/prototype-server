(function() {

	var crumb = {
		process: function(folder, config, callback) {
			var nicerPath = ('root'+
				folder.path.substring(
					folder.path.indexOf(config.docroot)+
					config.docroot.length,
					folder.path.length
				)).replace(/\/$/, '');
			var link = '';
			
			folder.breadcrumb = nicerPath.split('/').map(function(segment, i, all) {
				link += (segment === 'root' ? '' : segment)+'/';
				var ret = {
					title: segment
				};
				if(i !== all.length-1) {
					ret.link = link;
				}
				return ret;
			});
			
			callback(null, folder);
		}
	};
	
	module.exports = exports = crumb;
}());
