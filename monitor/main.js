
var sio = require('socket.io')
  , http = require('http')
  , request = require('request')
  , os = require('os')
  ;

// REDIS
//var client = redis.createClient(6379, '127.0.0.1', {})

var alertNum = 0;
var faultNum = 0;

var app = http.createServer(function (req, res) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end();
    })
  , io = sio.listen(app);


function alertNums()
{
    if(cpuAverage()>=20||memoryLoad()>=30)
        ++alertNum;

    return alertNum;
}
function faultNums()
{
    if(cpuAverage()>=50||memoryLoad()>=70)
        ++faultNum;

    return faultNum;
}

function memoryLoad()
{
//	console.log( os.totalmem(), os.freemem() );
	var remain = os.totalmem() - os.freemem();
	var percent = remain/os.totalmem();
	return percent*100;
}

// Create function to get CPU information
function cpuTicksAcrossCores() 
{
  //Initialise sum of idle and time of cores and fetch CPU info
  var totalIdle = 0, totalTick = 0;
  var cpus = os.cpus();
 
  //Loop through CPU cores
  for(var i = 0, len = cpus.length; i < len; i++) 
  {
		//Select CPU core
		var cpu = cpus[i];
		//Total up the time in the cores tick
		for(type in cpu.times) 
		{
			totalTick += cpu.times[type];
		}     
		//Total up the idle time of the core
		totalIdle += cpu.times.idle;
  }
 
  //Return the average Idle and Tick times
  return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
}

var startMeasure = cpuTicksAcrossCores();

function cpuAverage()
{
	var endMeasure = cpuTicksAcrossCores(); 
 
	//Calculate the difference in idle and total time between the measures
	var idleDifference = endMeasure.idle - startMeasure.idle;
	var totalDifference = endMeasure.total - startMeasure.total;
 
	//Calculate the average percentage CPU usage
	var busyDiff = totalDifference - idleDifference;
	return busyDiff / totalDifference * 100;
}

function measureLatenancy(server)
{
	var options =
	{
		url: 'http://52.5.33.235' + ":" + 5003,
	};
	request(options, function (error, res, body) 
	{
		//server.latency = undefined;
		var start = Date.now();
		if (res.statusCode == 200) {
//		    console.log(start) // Show the HTML for the Google homepage.
		}
		
		server.latency = Date.now() - start;
	});
//	console.log(server.latency);
	return server.latency;
}

function calcuateColor()
{
	// latency scores of all nodes, mapped to colors.
	var nodes = nodeServers.map( measureLatenancy ).map( function(latency) 
	{
		var color = "#cccccc";
		if( !latency )
			return {color: color};
		if( latency > 8000 )
		{
			color = "#ff0000";
		}
		else if( latency > 4000 )
		{
			color = "#cc0000";
		}
		else if( latency > 2000 )
		{
			color = "#ffff00";
		}
		else if( latency > 1000 )
		{
			color = "#cccc00";
		}
		else if( latency > 100 )
		{
			color = "#0000cc";
		}
		else
		{
			color = "#00ff00";
		}
		//console.log( latency );
		return {color: color};
	});
	//console.log( nodes );
	return nodes;
}


/// CHILDREN nodes
var nodeServers = [];

///////////////
//// Broadcast heartbeat over websockets
//////////////
setInterval( function () 
{
	io.sockets.emit('heartbeat', 
	{ 
		name: "Your Computer", cpu: cpuAverage(), memoryLoad: memoryLoad(), alertNums: alertNums(), faultNums: faultNums(),
        nodes: calcuateColor()
   });

}, 2000);

app.listen(3000);

/// NODE SERVERS

createServer(9000, function()
{
	// FAST
});
createServer(9001, function()
{
	// MED
	for( var i =0 ; i < 300; i++ )
	{
		i/2;
	}
});
createServer(9002, function()
{
	// SLOW	
	for( var i =0 ; i < 2000000000; i++ )
	{
		Math.sin(i) * Math.cos(i);
	}	
});

function createServer(port, fn)
{
	// Response to http requests.
	var server = http.createServer(function (req, res) {
      res.writeHead(200, { 'Content-Type': 'text/html' });

      fn();

      res.end();
   }).listen(port);
	nodeServers.push( server );

	server.latency = undefined;
}

