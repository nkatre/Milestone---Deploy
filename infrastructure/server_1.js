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

app.get('/', function(req, res) {
	client.lpush("myPages",req.url)
  res.send('Welcome to Server_1, Port is 5001')
	
})


app.get('/recent', function(req, res) {
	
	client.lrange("myPages",0,4,function(error,items){
		items.forEach(function(item){
			console.log(item)
			
		})
		res.json(items)
	})
  
})


client.set("key", "value");
client.get("key", function(err,value){ console.log(value)});


app.get('/set',function(req,res){
	client.lpush("myPages",req.url)
	client.set("key", "The message will self-destruct in 10 seconds.");
	client.expire("key",10);
})


app.get('/get',function(req,res){
	client.lpush("myPages",req.url)
	client.get("key", function(err,value){ console.log(value)});
	var value=client.get("key", value)
	
	res.send(value)
})

app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
			client.lpush("myPicture",img)
	  		console.log(img);
		});
	}

   res.status(204).end()
}]);

app.get('/meow', function(req, res) {
	{
		client.lpush("myPages",req.url)
		client.lrange("myPicture",0,1,function(err,items){
			var imagedata=items[0]
			res.send("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
		})
	}
})

// HTTP SERVER
var server = app.listen(5001, function () {

  var host = server.address().address
  var port = server.address().port
client.lpush("site",5001)
  console.log('Example app listening at http://%s:%s', host, port)
})
