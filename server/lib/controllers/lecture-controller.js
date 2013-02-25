// lecture-controller.js

var Lecture = require('../models/lecture').Lecture;
var ResponseHandler = require('../handlers/response-handler').ResponseHandler;

exports.LectureController = (function(){
	"use strict";
	
	function LectureController() {
		this.lecture = new Lecture(27017, "localhost");
		this.responseHandler = ResponseHandler.getInstance();
	}

	LectureController.prototype.createLectureCode = function(request, response) {
		console.log("Generating a new lecture code for course...");
			
		var courseCode = request.body.courseCode;
		var lecturerUsername = request.body.username;
			
		this.lecture.getNewLectureCode(courseCode, lecturerUsername, function(newCourseCodeError, newCourseCodeResult){
			this.responseHandler.handleResponse(newCourseCodeError, newCourseCodeResult, request, response);
		});
	};

	LectureController.prototype.joinLecture = function(request, response) {
		console.log("Student joining a lecture...");
			
		var lectureCode = request.body.lectureCode;
		var deviceId = request.body.deviceId;
			
		this.lecture.joinLecture(lectureCode, deviceId, function(joinLectureError, joinLectureResult){
			this.responseHandler.handleResponse(joinLectureError, joinLectureResult, request, response);
		});
	};

	LectureController.prototype.endLecture = function(request, response) {
		console.log("Lecturer ending a lecture...");
			
		var lectureCode = request.body.lectureCode;
			
		this.lecture.endLecture(lectureCode, function(endLectureError, endLectureResult){
			this.responseHandler.handleResponse(endLectureError, endLectureResult, request, response);
		});
	};

	LectureController.prototype.leaveLecture = function(request, response) {
		console.log("Student leaving lecture...");
			
		var lectureCode = request.body.lectureCode;
		var deviceId = request.body.deviceId;

		this.lecture.leaveLecture(lectureCode, deviceId, function(leaveLectureError, leaveLectureResult){
			this.responseHandler.handleResponse(leaveLectureError, leaveLectureResult, request, response);
		});
	};

	LectureController.prototype.submitUnderstandingLevel = function(request, response) {
		console.log("Student submitting their current level of understanding...");
			
		var lectureCode = request.body.lectureCode;
		var deviceId = request.body.deviceId;
		var understandingLevel = request.body.understandingLevel;
			
		this.lecture.submitUnderstandingLevel(lectureCode, deviceId, understandingLevel, function(understandingError, understandingResult){
			this.responseHandler.handleResponse(understandingError, understandingResult, request, response);
		});
	};

	return LectureController;
})();