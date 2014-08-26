/*
	Module dependencies:
	- Express
	- Http (to run Express)
	- Body parser (to parse JSON requests)
	- Underscore (because it's cool: has useful libraries)
	- Socket.IO
*/
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var bodyParser = require('body-parser');
var io = require('socket.io').listen(http);
var path = require('path');
var _ = require('underscore');

/*
	The list of participants in our chatroom.
	The format of each participant will be:
	{
		id: 'sessionId',
		name: 'participantName'
	}
*/
var participants = [];


/* Server config */

//Server's IP address
app.set('ipaddr', '127.0.0.1');

//Server's port number
app.set('port', 8080);

//Specify the views folder
app.set('views', path.join(__dirname, 'views'));
console.log(app.get('view_engine'));
//View engine is Jade
app.set('view engine', 'jade');

//Specify where the static content is
app.use(express.static('public', path.join(__dirname, 'public')));

//Tells server to support JSON requests
app.use(bodyParser.json());


/* Server routing */

//Handle route "GET /", as in "http://localhost:8080/"
app.get('/', function(req, res){

	//Render the view called "index"
	res.render('index');

});

//POST method to create a chat message
app.post('/message', function(req, res){

	//The request body expects a param named "message"
	var message = req.body.message;

	//If the message is empty or wasn't sent it's a bad request
	if(_.isUndefined(message) || _.isEmpty(message.trim())){
		return res.json(400, {error: "Message is invalid"});
	}

	//We also expect the sender's name with the message
	var name = req.body.name;

	//Let our chatroom know there was a new message
	io.sockets.emit('incomingMessage', {message: message, name: name});

	//Looks good, let the client know
	res.json(200, {message: "Message recieved"});

});

/* Socket.IO events */
io.on('connection', function(socket){

	/*
	When a new user connects to our server, we expect an event called "newUser" and the we'll emit an event called "newConnection" with a list of all participants to all connected clients
	*/
	socket.on("newUser", function(data){
		participants.push({id: data.id, name: data.name});
		console.log(participants);
		io.sockets.emit('newConnection', {participants: participants, new_id: data.id, new_name: data.name});
	});
	
	/*
	When a user changes his/her name, we are expecting an event called "nameChange" and then we'll emit an event called "nameChanged" to all participants with the id and new name of the user who emitted the original message
	*/
	socket.on("nameChange", function(data){
		_.findWhere(participants, {id: socket.id}).name = data.name;
		console.log(participants);
		io.sockets.emit("nameChanged", {id: data.id, name: data.name});
	});

	/*
	When a client disconnects from the server, the event "disconnect" is automatically captured by the server. It will then emit an event called "userDisconnected" to all participants with the id of the client that disconnected
	*/
	socket.on("disconnect", function(data){
		participants.splice(participants.indexOf(_.findWhere(participants, {id: socket.id})), 1);
		console.log(participants);
		io.sockets.emit("userDisconnected", {id: socket.id, sender: 'system'});
	});

});

//Start the http server at port and IP defined before
http.listen(app.get('port'), app.get('ipaddr'), function(){
	console.log("Server up and running. Go to http://"+app.get('ipaddr')+":"+app.get('port'));
});