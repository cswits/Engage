var Lecturer = require('../models/lecturer').Lecturer;
var ResponseHandler = require('../handlers/response-handler').ResponseHandler;

exports.LecturerController = (function() {
	function LecturerController() {
		this.prototype.lecturer = new Lecturer();
		this.prototype.ResponseHandler = new ResponseHanlder();
		
		Lecturer.prototype.authenticateLecturer = function(request, response) {
			console.log("Lecturer logging into the system...");
			
			var lecturerUsername = request.body["username"];
			var lecturerPassword = request.body["password"];
			this.lecturer.authenticate(lecturer)
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