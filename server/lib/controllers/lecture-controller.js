var Lecture = require('../models/lecture').Lecture;
var ResponseHandler = require('../handlers/response-handler').ResponseHandler;

exports.LectureController = (function(){
	function LectureController() {
		this.prototype.lecture = new Lecture(27017, "localhost");
		
		this.prototype.responseHandler = new ResponseHandler();
		
		LectureController.prototype.createLectureCode = function(request, response) {
			console.log("Generating a new lecture code for course...");
			
			var courseCode = request.body["courseCode"];
			
			this.lecture.getNewLectureCode(courseCode, function(newCourseCodeError, newCourseCodeResult){
				this.responseHandler.handleResponse(newCourseCodeError, newCourseCodeResult, request, response);
			});
		};
		
		LectureController.prototype.joinLecture = function(request, response) {
			console.log("Student joining a lecture...");
			
			var lectureCode = request.body["lectureCode"];
			var deviceId = request.body["deviceId"];
			
			this.lecture.joinLecture(lectureCode, devideId, function(joinLectureError, joinLectureResult){
				this.responseHandler.handleResponse(joinLectureError, joinLectureResult, request, response);
			});	
		};
		
		LectureController.prototype.endLecture = function(request, response) {
			console.log("Lecturer ending a lecture...");
			
			var lectureCode = request.body["lectureCode"];
			this.lecture.endLecture(lectureCode, function(endLectureError, endLectureResult){
				this.responseHandler.handleResponse(endLectureError, endLectureResult, request, response);
			});
		};
	}
	return LectureController;
})();