// requiring packages
var Lecturer = require('./lecturer').Lecturer;
var lecturer = new Lecturer();
var LecturerController = requires('../lib/controllers/lecturer-controller').LecturerController;

module.exports = function(app) {
	app.get('/lecturers/login', function(request, response) {
		new LecturerController().authenticateLecturer(request, response);
	});
	
	app.get('/lecturers/create', function(request, response) {
		new LecturerController().createLecturer(request, response);
	});
	
	app.get('/lecturers/delete/:username', function(request, response) {
		new LecturerController().deleteLecturer(request, response);
	});
}


// lecturer logging into the system
app.get('/lecturers/login', function(request, response) {
	console.log("Lecturer login to Engage ...");
	var lecturerUsername =  request.body["username"];
	var lecturerPassword = request.body["password"];
	lecturer.authenticate(lecturerUsername, lecturerPassword, function(authenticationError, result) {
		if (authenticationError) this.respondWithError(authenticationError, response);
		else this.respondWithSuccess(result, request, response);
	});
});

app.get('/lecturers/create', function(request, response) {
	console.log("Creating a lecturer in the db ...");
	
	var username = request.body["username"];
	var password = request.body["password"];
	var lastname = request.body["lastname"];
	var firstname = request.body["firstname"];
	var title = request.body["title"];
	
	lecturer.create(username, password, lastname, firstname, title, function(createError, createResult) {
		if (createError) this.respondWithError(createError, response);
		else this.respondWithSuccess(createResult, request, response);
	});
});

app.get('/lecturers/delete/:username', function(request, response) {
	console.log("Deleting user " + request.params["username"] + ' ...');
	
	var username = request.params["username"];
	
	lecturer.delete(username, function(deleteError, deleteResult) {
		if (deleteError) this.respondWithError(deleteError, response);
		else this.respondWithSuccess(deleteResult, request, response);
	});
});
