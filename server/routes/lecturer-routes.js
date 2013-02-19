// requiring packages
var Lecturer = require('./lecturer').Lecturer;
var lecturer = new Lecturer();
var LecturerController = requires('../lib/controllers/lecturer-controller').LecturerController;

module.exports = function(app) {
	// login
	app.get('/lecturers/login', function(request, response) {
		new LecturerController().authenticateLecturer(request, response);
	});
	
	// create a lecturer in the system
	app.get('/lecturers/create', function(request, response) {
		new LecturerController().createLecturer(request, response);
	});
	
	// delete a lecturer from the system
	app.get('/lecturers/delete/:username', function(request, response) {
		new LecturerController().deleteLecturer(request, response);
	});
}