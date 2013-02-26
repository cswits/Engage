// requiring packages
var LecturerController = require('../lib/controllers/lecturer-controller').LecturerController;

module.exports = function(app, io) {
	// login
	app.get('/lecturers/login', function(request, response) {
		new LecturerController(io).authenticateLecturer(request, response);
	});
	
	// create a lecturer in the system
	app.get('/lecturers/create', function(request, response) {
		new LecturerController(null).createLecturer(request, response);
	});
	
	// delete a lecturer from the system
	app.get('/lecturers/delete/:username', function(request, response) {
		new LecturerController(null).deleteLecturer(request, response);
	});
}