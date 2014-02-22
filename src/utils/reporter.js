var ua = new (require('user-agent-parser'))();
module.exports = {
	req: function(req, res) {
		var d = new Date();
		var details = (' ['+req.method+' '+req.url+' '+res.statusCode+'] ')[res.statusCode ? res.statusCode > 399 ? 'red' : 'blue' : 'grey'];
		var result = ua.setUA(req.headers['user-agent']).getResult();

		console.log((d.toLocaleDateString()+' '+d.toLocaleTimeString()).green+details+(result.browser.name+'v'+result.browser.version).magenta);
	}
};