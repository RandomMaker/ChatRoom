/*
	Module dependencies:
	- Express
	- Http (to run Express)
	- Body parser (to parse JSON requests)
*/
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var bodyParser = require('body-parser');

/* Server config */

//Server's IP address
app.set('ipaddr', '127.0.0.1');

//Server's port number
app.set('port', 8080);

//Tells server to support JSON requests
app.use(bodyParser.json());


/* Server routing */

//Handle route "GET /", as in "http://localhost:8080/"
app.get('/', function(req, res){

	//Show a simple response message
	res.send("Server is up and running");

});


//Start the http server at port and IP defined before
http.listen(app.get('port'), app.get('ipaddr'), function(){
	console.log("Server up and running. Go to http://"+app.get('ipaddr')+":"+app.get('port'));
});