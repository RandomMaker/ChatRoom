// Import Necessary Modules
var express = require('express');
	app = require('express')();
	server = require('http').Server(app);
	path = require('path');
	favicon = require('serve-favicon');
	logger = require('morgan');
	cookieParser = require('cookie-parser');
	bodyParser = require('body-parser');
	multer = require('multer');
	io = require('socket.io').listen(server);
	path = require('path');
	underScore = require('underscore');

// Listen On Specific Port
server.listen(8080);

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

// Server's IP address
// app.set('ipaddr', '127.0.0.1');

// Server's port number
app.set('port', (process.env.PORT || 8080));

// Specify the views folder
app.set('views', path.join(__dirname, 'views'));

// View engine is Jade
app.set('view engine', 'jade');

// Specify where the static content is
app.use(express.static('public', path.join(__dirname, 'public')));

// Tells server to support JSON requests
app.use(bodyParser.json());


/* Server routing */

// Handle route "GET /", as in "http://localhost:8080/"
app.get('/', function(req, res){

	// Render the view called "index"
	res.render('index');

});

// POST method to create a chat message
app.post('/message', function(req, res){

	// The request body expects a param named "message"
	var message = req.body.message;

	// If the message is empty or wasn't sent it's a bad request
	if(underScore.isUndefined(message) || underScore.isEmpty(message.trim())){
		return res.json(400, {error: "Message is invalid"});
	}

	// We also expect the sender's name with the message
	var name = req.body.name;

	// Let our chatroom know there was a new message
	io.sockets.emit('incomingMessage', {message: message, name: name});

	// Looks good, let the client know
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
		underScore.findWhere(participants, {id: socket.id}).name = data.name;
		console.log(participants);
		io.sockets.emit("nameChanged", {id: data.id, name: data.name});
	});

	/*
	When a client disconnects from the server, the event "disconnect" is automatically captured by the server. It will then emit an event called "userDisconnected" to all participants with the id of the client that disconnected
	*/
	socket.on("disconnect", function(data){
		participants.splice(participants.indexOf(underScore.findWhere(participants, {id: socket.id})), 1);
		console.log(participants);
		io.sockets.emit("userDisconnected", {id: socket.id, sender: 'system'});
	});

});

// Start the http server at port and IP defined before
server.listen(app.get('port'), app.get('ipaddr'), function(){
	console.log("Server up and running. Go to http:// "+app.get('ipaddr')+":"+app.get('port'));
});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;