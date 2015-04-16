var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
	console.log(req.method, req.url);

	// ... INSERT HERE.
	

	next(); // Passing the request to the next handler in the stack.
});

// get a random number
function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

var num= randomIntInc(1, 100);
function proxy(req,res){
	num= randomIntInc(1, 100);
	console.log(num);
	if (num < 101) {
		client.rpoplpush("site","list",function(error,item){
		item = 5001
		console.log("run server1")
	//	num = 1;
		res.redirect("http://52.5.33.235:"+item+req.url);
		});
		client.rpoplpush("list","site")
	} else {
		client.rpoplpush("site","list",function(error,item){
                item = 5002
                console.log("run server2")
          //      num = 2;
                res.redirect("http://52.5.15.126:"+item+req.url);
	        });
       		client.rpoplpush("list","site")
	}
}	
app.get('/', function(req, res) {
  	proxy(req,res)
})

app.get('/meow', function(req, res) {
	proxy(req,res)
})


app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
			client.lpush("picture",img)
	  		console.log(img);
		});
	}

   res.status(204).end()
}]);
// HTTP SERVER
var server = app.listen(5000, function () {

//  var host = server.address().address
  var host = "52.4.40.18"
  var port = server.address().port
	client.lpush("site",5000)
  console.log('Example app listening at http://%s:%s', host, port)
})
