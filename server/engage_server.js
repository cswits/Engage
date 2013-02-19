// engage_server.js

var express = require('express');
var Lecturer = require('./lecturer').Lecturer;
var Lecture = require('./lecture').Lecture;

// set up the app server
var app = express();
app.set( "jsonp callback", true);

var lecturer = new Lecturer(27017, "localhost");
var lecture = new Lecture(27017, "localhost");

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

require('./routes/lecturer-routes')(app);

// lecturer logging into the system
app.get('/users/login', function(request, response) {
	console.log("Lecturer login to Engage ...");
	var lecturerUsername =  request.body["username"];
	var lecturerPassword = request.body["password"];
	lecturer.authenticate(lecturerUsername, lecturerPassword, function(authenticationError, result) {
		if (authenticationError) this.respondWithError(authenticationError, response);
		else this.respondWithSuccess(result, request, response);
	});
});

// lecturer creating a new lecture code
app.get('/lecture/code/new', function(request, response) {
	console.log("Lecturer requesting a lecture code...");
	
	var courseCode = request.body["courseCode"];
	lecture.getNewLectureCode(courseCode, function(lectureCodeError, lectureCode){
		if (lectureCodeError) this.respondWithError(lectureCodeError, response);
		else this.respondWithSuccess(lectureCode, request, response);
	});
});

// student joining a lecture
app.get('/lecture/join', function(request, response) {
	console.log("Student joining a lecture....");
	
	var lectureCode = request.body["lectureCode"];
	var deviceId = request.body["deviceId"];
	
	lecture.joinLecture(lectureCode, deviceId, function(joinLectureError, joinLectureResult){
		if (joinLectureError) this.respondWithError(joinLectureError, response);
		else this.respondWithSuccess(joinLectureResult, request, response);
	});
});


// lecturer ending a lecture
app.get('/lecture/end', function(request, response) {
	console.log("Ending lecture...");
	
	var lectureCode = request.body["lectureCode"];
	lecture.endLecture(lectureCode, function(endLectureError, endLectureResult) {
		if (endLectureError) this.respondWithError(endLectureError, response);
		else this.respondWithSuccess(endLectureResult, request, response);
	});
});

app.get('/lecture/leave', function(request, response) {
	console.log("Student leaving lecture");
	
	var lectureCode = request.body["lectureCode"];
	var deviceId = request.body["deviceId"];
	
	lecture.leaveLecture(lectureCode, deviceId, function(leaveLectureError, leaveLectureResult) {
		if (leaveLectureError) this.respondWithError(leaveLectureError, response);
		else this.respondWithSuccess(leaveLectureResult, request, response);
	});
});

app.get('/understanding/add', function(request, response) {
	console.log("Student submitting current understanding level");
	
	var lectureCode = request.body["lectureCode"];
	var deviceId = request.body["deviceId"];
	var understanding_level = request.body["understanding"];
	
	lecture.submitUnderstandingLevel(lectureCode, deviceId, understanding_level, function(understandingError, understandingResult) {
		if (understandingError) this.respondWithError(understandingError, response);
		else this.respondWithSuccess(understandingResult, request, response);
	});
});

// app.get('/users/create', function(request, response) {
// 	console.log("Creating a lecturer in the db ...");
// 	
// 	var username = request.body["username"];
// 	var password = request.body["password"];
// 	var lastname = request.body["lastname"];
// 	var firstname = request.body["firstname"];
// 	var title = request.body["title"];
// 	
// 	lecturer.create(username, password, lastname, firstname, title, function(createError, createResult) {
// 		if (createError) this.respondWithError(createError, response);
// 		else this.respondWithSuccess(createResult, request, response);
// 	});
// });
// 
// app.get('/users/delete/:username', function(request, response) {
// 	console.log("Deleting user " + request.params["username"] + ' ...');
// 	
// 	var username = request.params["username"];
// 	
// 	lecturer.delete(username, function(deleteError, deleteResult) {
// 		if (deleteError) this.respondWithError(deleteError, response);
// 		else this.respondWithSuccess(deleteResult, request, response);
// 	});
// });

app.get('/understanding/refresh/:lectureCode', function(request, response) {
	console.log("Refreshing the average understanding graph...");
	
	var lectureCode = request.params["lectureCode"];
	
	lecture.refreshAverageUnderstandingLevel(lectureCode, function(error, result){
		if (error) this.respondWithError(error, response);
		else this.respondWithSuccess(result, request, response);
	});
	
});

app.listen(7001);
console.log("Engage server listening on port 7001");