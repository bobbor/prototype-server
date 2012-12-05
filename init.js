var cluster = require('cluster');
var server = require('./main');
var cpus = require('os').cpus().length;
var workers = {};

var rssWarn = (75 * 1024 * 1024);
var rssLimit = (100 * 1024 * 1024);

if( cluster.isMaster ) {
	for( var i = 0; i < cpus; i++) {
		createWorker();
	}

	setInterval(function() {
		var now = +(new Date());
		for( var pid in workers) {
			if( workers.hasOwnProperty(pid) && (workers[pid].lastCb + 5000 < now) ) {
				console.log('killing worker ' + pid + ' - Reason: Not Responding');
				workers[pid].worker.destroy();
				delete workers[pid];
				createWorker();
			}
		}
	}, 1000);

} else {
	
	server.create();
}

function createWorker() {
	var worker = cluster.fork();
	var pid = worker.process.pid;
	console.log('created worker: ', pid);

	workers[pid] = {
		worker: worker,
		lastCb: +(new Date()) - 1000
	};

	worker.on('message', function( m ) {
		if( m.cmd === 'reportMem' ) {
			workers[m.process].lastCb = +(new Date());
			if( m.memory.rss > rssLimit ) {
				console.log('killing worker ' + pid + ' - Reason: RSS Limit Reached');
				workers[m.process].worker.destroy();
				delete workers[pid];
				createWorker();
			}

			if( m.memory.rss > rssWarn ) {
				console.log('RSS WARNING: ' + m.process + ' - ' + (m.memory.rss / (1024 * 1024)) + 'MB');
			}
		}
	});
}