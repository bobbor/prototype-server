(function() {

	// displays files inline in the server-pages when they are whitelisted
	// TODO: add support for images and media

	var mime = require('mime');
	var _ = require('underscore');
	var inline = {
		process: function(file, config, callback) {

			// check if file was called directly (i mean per URL, y'know?)
			var last_in_ref = file.referer.split('/');
			last_in_ref = last_in_ref[last_in_ref.length-1];
			if(file.referer.lastIndexOf('/') !== file.referer.length-1 && 
				last_in_ref !== file.name) {
				callback(null, file);return;
			}

			// now, we know, we want to display the file in the browser, 
			// we need to know if it is allowed, to be displayed
			var filter = file.config.inline || [];
			if(!_.isArray(filter)) { filter = [];}
			var type = mime.lookup(file.name, 'text/plain');
			var inFilter = false;
			filter.forEach(function(fil, i) {
				inFilter = inFilter || RegExp(fil).test(type);
				return !inFilter;
			});
			if(!inFilter) {
				callback(null, file);
			}

			// ok, so all is set, the file is supposed to be displayed inline
			// in a HTML page of the prototype-server
			// let's generate the data

			var nicerPath = ('root/'+
				file.path.substring(
					file.path.indexOf(file.config.docroot)+
					file.config.docroot.length,
					file.path.length
				)).replace(/\/$/, '');
			var link = '';
			
			
			if(inFilter) {

				// set the type to a type never used, so mime and express never
				// get the idea of using it.
				file.type = 'customHTML';
				file.template = 'inline';
				file.breadcrumb = nicerPath.split('/').map(function(segment) {
					link += (segment === 'root' ? '' : segment)+'/';
					return {
						link: link,
						title: segment
					};
				});
				callback(null, file);
				return;
			}
		}
	};
	
	module.exports = inline;
}());