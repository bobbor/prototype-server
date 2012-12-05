(function() {

	var crumb = {
		process: function(folder, callback) {
			var nicerPath = ('root/'+
				folder.path.substring(
					folder.path.indexOf(folder.config.docroot)+
					folder.config.docroot.length,
					folder.path.length
				)).replace(/\/$/, '');
			var link = '';
			
			folder.breadcrumb = nicerPath.split('/').map(function(segment) {
				link += (segment === 'root' ? '' : segment)+'/';
				return {
					link: link,
					title: segment
				};
			});
			
			callback(null, folder);
		}
	};
	
	module.exports = exports = crumb;
}());
