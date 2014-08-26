function init() {

	var serverBaseUrl = document.domain;

	/*
	On client init, try to connect to the socket.IO server.
	Note we don't specify a port since we set up our server to run on port 8080
	*/
	var socket = io.connect(serverBaseUrl);

	// We'll save our session ID in a variable for later
	var sessionId = '';

	// Interval variable for the connection indicator/logo
	var logoInterval;


	// Socket Events

	/*
	When the client successfully connects to the server, an event 'connect' is emitted. Let's get the session ID and log it.
	Also, let the socket.IO server know there's a new user with a session ID and a name. We'll emit the "newUser" event for that.
	*/
	socket.on('connect', function(){
		sessionId = socket.io.engine.id;
		console.log('Connected ' + sessionId);
		prepareUI();
		socket.emit('newUser', {id: sessionId, name: $('#name').val()});
	});

	socket.on('newConnection', function(data){
		updateParticipants(data);
	});

	socket.on('userDisconnected', function(data){
		$('#'+data.id).remove();
	});

	socket.on('nameChanged', function(data){
		$('#'+data.id).html(data.name + (data.id === sessionId ? ' (You)' : ' '));
	});

	socket.on('incomingMessage', function(data){
		var message = data.message;
		var name = data.name;
		$('#messages').append(messageWrapper("<b>"+name+": </b>"+message));
	});

	socket.on('error', function(err){
		clearInterval(logoInterval);
		$('#logo').addClass('disconnected');
		alert('Unable to connect to server: '+err);
	});



	// JQuery Events

	$('#name').focusout(function(event){
		var name = $('#name').val();
		if(!name){
			return $('#name').val("Anonymous");
		}
		socket.emit('nameChange', {id: sessionId, name: name});
	});

	$('#name').mouseover(function(event){
		$('#name').tooltip('show');
	});

	$('#name').mouseout(function(event){
		$('#name').tooltip('hide');
	});

	$('#send').click(function(event){
		sendMessage();
	});

	$('#outgoingMessage').keydown(function(event){
		if(event.which === 13){
			event.preventDefault();
			sendMessage();
		}
	});



	// Helper Functions

	// sendMessage() does a simple AJAX POST call to our server
	function sendMessage(){
		var outgoingMessage = $('#outgoingMessage').val();
		
		if(!outgoingMessage){
			return;
		}

		var name = $('#name').val();
		$.ajax({
			url: '/message',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify({message: outgoingMessage, name: name})
		});

		$('#outgoingMessage').val('');
	}

	function updateParticipants(data){
		var participantsElement = $('#participants');
		if(participantsElement.html() == ''){
			data.participants.forEach(function(participant){
				participantsElement.append(messageWrapper(participant.name+(sessionId === participant.id ? " (You)" : " "), participant.id));
			});
		}
		else{
			participantsElement.append(messageWrapper(data.new_name, data.new_id));
		}
	}

	function prepareUI(){
		$('#logo').removeClass('disconnected');

		logoInterval = setInterval(function(){
			$('#logo').toggleClass('on');
		}, 1500);

		$('#participants').empty();
		$('#name').focus();
		$('#messages').append(messageWrapper("Welcome to the Chat!"));
	}

	function messageWrapper(content, id){
		return "<div id='"+(id === undefined ? '' : id)+"' class='message'>"+content+"</div>";
	}
	
}

$(document).on('ready', init);