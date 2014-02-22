(function() {
	var _ = require('underscore');
	var helper = {};
	
	helper.shortifyMIMEs = function(type) {
		if(type === 'folder') {
			return 'type-folder';
		} else if(type === 'generic') {
			return 'type-generic';
		} else {
			var names = type.split('/');
			if(names[1].indexOf('-') !== -1) {
				names[1] = names[1].split('-')[1];
			}
			return names.map(function(item, i) {
				return 'type-'+item.replace(/\./gi, '_');
			}).join(' ');
		}
	};
	
	helper.humanReadable = {
		size: function(size) {
			var suffixes = [' B', ' K', ' M', ' G', ' T'];
			var idx = 0;
			var iterator = function(size) {
				var nextStep = ((size / 1024)|0);
				if(!nextStep) {
					return size + suffixes[idx];
				}
				idx++;
				return iterator(nextStep);
			};
			return iterator(size);
		},
		time: function(timestamp) {
			var diff = (+(new Date())) - timestamp.getTime();
			var current = {
				single: ' second',
				multi: ' seconds'
			};
			var idx = -1;
			var steps = [{
					split: 60,
					single: ' minute',
					multi: ' minutes'
				}, {
					split: 60,
					single: ' hour',
					multi: ' hours'
				}, {
					split: 24,
					single: ' day',
					multi: ' days'
				}, {
					split: 30,
					single: ' month',
					multi: ' months'
				},{
					split: 12,
					single: ' year',
					multi: ' years'
				}];
			var iterator = function(time) {
				if(!steps[idx+1]) {
					return time+(time !== 1 ? current.multi : current.single);
				}
				var newTime = (time/steps[idx+1].split)|0;
				if(!newTime) {
					return time+(time !== 1 ? current.multi : current.single);
				}
				idx++;
				current = steps[idx];
				return iterator(newTime);
			};
			
			if(diff < 1000) {
				return 'less than a second ago';
			}
			diff = (diff/1000)|0;
			return iterator(diff)+' ago';
		}
	};

	module.exports = exports = helper;
}());
