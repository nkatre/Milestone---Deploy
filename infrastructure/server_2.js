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

	next(); // Passing the request to the next handler in the stack.
});


app.get('/', function(req, res) {
  res.send('Welcome to Server_2, Port is 5002')
})


app.get('/meow', function(req, res) {
	{
		client.lrange("myPicture",0,1,function(err,items){
			var imagedata=items[0]
			res.send("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
		})
	}
})
// HTTP SERVER
var server = app.listen(5002, function () {

  var host = server.address().address
  var port = server.address().port
	client.lpush("site",5002)
  console.log('Example app listening at http://%s:%s', host, port)
})
