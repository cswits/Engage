var Lecturer = require('../models/lecturer').Lecturer;

exports.LecturerController = (function() {
	function LecturerController() {
		this.prototype.lecturer = new Lecturer();
		
		Lecturer.prototype.authenticateLecturer = function(request, response) {
			console.log("Lecturer logging into the system...");
			
			var lecturerUsername = request.body
		};
		
		Lecturer.prototype.createLecturer = function(request, response) {
			
		};
		
		Lecturer.prototype.deleteLecturer = function(request, response) {
			
		};
		
	}
	return LecturerController;
})();



console.log("Lecturer login to Engage ...");
var lecturerUsername =  request.body["username"];
var lecturerPassword = request.body["password"];
lecturer.authenticate(lecturerUsername, lecturerPassword, function(authenticationError, result) {
	if (authenticationError) this.respondWithError(authenticationError, response);
	else this.respondWithSuccess(result, request, response);
});