var cluster = require('cluster');
var util = require('util');
var server = require('./main');
var colors = require('colors');
var cpus = 1//require('os').cpus().length;
var workers = {};

var rssWarn = (150 * 1024 * 1024); // 220MB
var rssLimit = (200 * 1024 * 1024); //250MB

var justify = function(o, pre, sum) {
	var i;
	o += '';
	for(i = 0; i < pre; i++) {
		o = ' '+o;
	}
	for(i = o.length; i < sum; i++) {
		o+= ' ';
	}
	return o;
}
var log = function(w) {
	return;
	util.print("\u001b[2J\u001b[0;0H");
	console.log('\n'+'  '+'prototype server'.bold.underline+'\n');
	console.log('/====================================================================\\');
	console.log('| #  | pid   | port | mem  | warn | limit | status                   |')
	console.log('|====|=======|======|======|======|=======|==========================|');
	var i = 1;
	for(var prop in w) {
		console.log('|'+
			justify(i, 1, 4)+'|'+
			justify(prop, 1, 7)+'|'+
			justify(w[prop].port, 1, 6).blue+'|'+
			justify(((w[prop].mem/1024/1024)|0)+'M', 1, 6)+'|'+
			justify(((rssWarn/1024/1024)|0)+'M', 1, 6).yellow+'|'+
			justify(((rssLimit/1024/1024)|0)+'M', 1, 7).red+ '|'+
			(justify(w[prop].status.text, 1, 26))[w[prop].status.color]+'|');
		i++;
	}
	console.log('\\====================================================================/');
};

if( cluster.isMaster ) {
	for( var i = 0; i < cpus; i++) {
		createWorker();
	}

	setInterval(function() {
		var now = +(new Date());
		for( var pid in workers) {
			if( workers.hasOwnProperty(pid) && (workers[pid].lastCb + 5000 < now) ) {
				workers[pid].status = {
					text: 'not responding',
					color: 'red'
				};
				log(workers);
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
	workers[pid] = {
		worker: worker,
		lastCb: +(new Date()) - 1000,
		lastDisplay: +(new Date()) - 10000,
		status: {
			text: 'idle',
			color: 'white'
		},
		port: '-1',
		mem: '-1'
	};
	log(workers)

	worker.on('message', function( m ) {
		if( m.cmd === 'reportMem' ) {
			workers[m.process].lastCb = +(new Date());
			workers[m.process].mem = m.memory.rss;
			if( m.memory.rss > rssLimit ) {
				workers[m.process].status = {
					text: 'himem',
					color: 'red'
				};
				log(workers);
				workers[m.process].worker.destroy();
				delete workers[pid];
				createWorker();
				return;
			}
			if( m.memory.rss > rssWarn && m.memory.rss < rssLimit ) {
				workers[m.process].status = {
					text: 'lowmem',
					color: 'yellow'
				}
				log(workers)
				return;
			}
			workers[m.process].status = {
				text: 'ok',
				color: 'green'
			}
			log(workers);
		}
		if(m.cmd === 'state') {
			workers[m.process].status = {
				text: m.state?'ok':'fail',
				color: m.state?'green':'red'
			};
			workers[m.process].port = m.port;
			log(workers)
		}
	});
}
