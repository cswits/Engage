var express = require('express');
var Lecturer = require('./lecturer').Lecturer;

// set up the app server
var app = express();
app.set( "jsonp callback", true);

var lecturer = new Lecturer(27017, "localhost");

// define configuration for express
app.configure(function() {
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
});

// responding to http requests

respondWithError = function(error, response) {
	var errorMessage = error.message;
	response.writeHead(404, {"Content-Type": "text/plain"});
	response.end(errorMessage);
};

respondWithSuccess = function(result, request, response) {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
	response.header("Content-type", "application/json");
	response.header('Charset', 'utf8');
	response.send(request.query.callback + '(' + JSON.stringify(result) + ')');
};

// routes

app.get('/login', function(request, response) {
	console.log("Lecturer login to Engage ...");
	var lecturerUsername =  request.body["username"];
	var lecturerPassword = request.body["password"];
	lecturer.authenticate(lecturerUsername, lecturerPassword, function(authenticationError, result) {
		if (authenticationError) this.loginRespondWithError(authenticationError, response);
		else this.respondWithSuccess(result, request, response);
	});
});

app.listen(7001);
console.log("Engage server listening on port 7001");