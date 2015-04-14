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


function proxy(req,res){
	client.rpoplpush("site","list",function(error,item){
		console.log(item)
		res.redirect("http://localhost:"+item+req.url);
	});
	client.rpoplpush("list","site")
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

  var host = server.address().address
  var port = server.address().port
	client.lpush("site",5000)
  console.log('Example app listening at http://%s:%s', host, port)
})
