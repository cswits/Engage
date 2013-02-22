// lecture.js

var async = require('async');
var Validator = require('../handlers/validator').Validator;
var DataHandler = require('../handlers/data-handler').DataHandler;
var UnderstandingData = require('../handlers/understanding-data').UnderstandingData;


exports.Lecture = (function(){
	function Lecture(port, host, io) {
		this.validator = Validator.getInstance();
		this.dataHandler = DataHandler.getInstance(port, host, io);
		
		// generate new lecture code
		Lecture.prototype.getNewLectureCode = function(courseCode, lecturerUsername, callback) {
			var validateForLectureCode = {
				courseCode: function(courseCodePartialCallback){
					this.validateCourseCode(courseCode, function(couseCodeValidationError, validatedCourseCode) {
						if (courseCodeValidationError) courseCodePartialCallback(courseCodeValidationError, null);
						else courseCodePartialCallback(null, validatedCourseCode);
					});
				},
				lecturerUsername: function(lecturerUsernamePartialCallback) {
					this.validateUsername(lecturerUsername, function(lecturerUsernameError, validatedUsername) {
						if (lecturerUsernameError) lecturerUsernamePartialCallback(lecturerUsernameError, null);
						else lecturerUsernamePartialCallback(null, validatedUsername);
					});
				}
			};
			
			async.parallel(validateForLectureCode, function(validationError, validationResult) {
				if (validationError) callback(validationError, null);
				else {
					this.dataHandler.generateNewLectureCode(validationResult["courseCode"], validationResult["lecturerUsername"], function(lectureCodeError, lectureCodeResult) {
						if (lectureCodeError) callback(lectureCodeError, null);
						else {
							var newLectureCodeResult = {
								lectureCode: lectureCodeResult
							};
							callback(null, newLectureCodeResult);
						}
					});
				}
			});
		};
				
		// joining a lecture
		Lecture.prototype.joinLecture = function(lectureCode, deviceID, callback) {
			var validateForJoinLecture = {
				deviceID: function(deviceIDPartialCallback) {
					this.validateDeviceId(deviceID, function(deviceIDValidationError, validatedDeviceID){
						if (deviceIDValidationError) deviceIDPartialCallback(deviceIDValidationError, null);
						else deviceIDPartialCallback(null, validatedDeviceID);
					})
				},
				lectureCode: function(lectureCodePartialCallback) {
					this.validateLectureCode(lectureCode, function(lectureCodeValidationError, validatedLectureCode){
						if (lectureCodeValidationError) lectureCodePartialCallback(lectureCodeValidationError, null);
						else lectureCodePartialCallback(null, validatedLectureCode);
					});
				}
			};
			
			async.parallel(validateForJoinLecture, function(validationError, validationResult){
				if (validationError) callback(validationError, null);
				else {
					this.dataHandler.mapLectureCodeToStudent(validationResult["lectureCode"], validationResult["deviceID"], function(joinError, joinResult) {
						if (joinError) callback(joinError, null);
						else callback(null, joinResult);
					});
				}
			});
		};
		
		Lecture.prototype.endLecture = function(lectureCode, callback) {
			this.validateLectureCode(lectureCode, function(lectureCodeValidationError, validatedLectureCode){
				if (lectureCodeValidationError) callback(lectureCodeValidationError, null);
				else {
					this.dataHandler.endLecture(validatedLectureCode, function(endLectureError, endLectureResult) {
						if (endLectureError) callback(endLectureError, null);
						else callback(null, endLectureResult);
					});
				}
			});
		};
		
		Lecture.prototype.leaveLecture = function(lectureCode, deviceID, callbacl) {
			var validateForLeaveLecture = {
				lectureCode: function(lectureCodePartialCallback) {
					this.validateLectureCode(lectureCode, function(lectureCodeValidationError, validatedLectureCode){
						if (lectureCodeValidationError) lectureCodePartialCallback(lectureCodeValidationError, null);
						else lectureCodePartialCallback(null, validatedLectureCode);
					});
				},
				devideID: function(deviceIDPartialCallback) {
					this.validateDeviceId(deviceID, function(deviceIDValidationError, validatedDeviceID){
						if (deviceIDValidationError) deviceIDPartialCallback(deviceIDValidationError, null);
						else deviceIDPartialCallback(null, validatedDeviceID);
					});
				}
			};
			
			async.parallel(validateForLeaveLecture, function(validationError, validationResult) {
				if (validationError) callback(validationError, null);
				else {
					this.dataHandler.unmapLectureCodeFromStudent(validationResult["lectureCode"], validationResult["deviceID"], function(leaveError, leaveResult) {
						if (leaveError) callback(leaveError, null);
						else callback(null, leaveResult);
					});
				}
			});
		};
		
		Lecture.prototype.submitUnderstandingLevel = function(lectureCode, deviceID, understandingLevel, callback) {
			var validateForUnderstanding = {
				lectureCode: function(lectureCodePartialCallback) {
					this.validateLectureCode(lectureCode, function(lectureCodeValidationError, validatedLectureCode) {
						if (lectureCodeValidationError) lectureCodePartialCallback(lectureCodeValidationError, null);
						else lectureCodePartialCallback(null, validatedLectureCode);
					});
				},
				deviceID: function(deviceIDPartialCallback) {
					this.validateDeviceId(deviceID, function(deviceIDValidationError, validatedDeviceId) {
						if (deviceIDValidationError) deviceIDPartialCallback(deviceIDValidationError, null);
						else deviceIDPartialCallback(null, validatedDeviveId);
					});
				},
				understandingLevel: function(understandingLevelPartialCallback) {
					this.validateUnderstandingLevel(understandingLevel, function(understandingLevelValidationError, validatedUnderstandingLevel) {
						if (understandingLevelValidationError) understandingLevelPartialCallback(understandingLevelValidationError, null);
						else understandingLevelPartialCallback(null, validatedUnderstandingLevel);
					});
				}
			};
			
			async.parallel(validateForUnderstanding, function(validationError, validationResult) {
				if (validationError) callback(validationError, null);
				else {
					var now = new Date().toTimeString();
					var understandingData = new UnderstandingData(validationResult["understandingLevel"], now);
					
					this.dataHandler.addUnderstandingLevel(validationResult["lectureCode"], validationResult["deviceID"], understandingData, function(understandingError, understandingResult) {
						if (understandingError) callback(understandingError, null);
						else callback(null, understandingResult);
					});
				}
			});
		};
		
		// 	this method is still pending...
		Lecture.prototype.refreshAverageUnderstandingLevel = function(lectureCode, callback) {
			this.validateLectureCode(lectureCode, function(lectureCodeValidationError, validatedLectureCode){
				if (lectureCodeValidationError) callback(lectureCodeValidationError, null);
				else {
					var allLectureDevices = this.currentDeviceIds[validatedLectureCode];
					if (!allLectureDevices) {
						var wrongLectureCodeError = new Error("Lecture code " + validatedLectureCode + " does not exist");
						callback(wrongLectureCodeError, null);
					} else {
						callback(null, null);
					}
				}
			});
		};

		Lecture.prototype.simpleValidation = function(value, errorMessage, callback) {
			this.validator.validate(value, errorMessage, function(validationError, validationResult) {
				if (validationError) callback(validationError, null);
				else callback(null, validationResult);
			});
		};
		
		Lecture.prototype.validateUsername = function(username, errorMessage, callback) {
			this.simpleValidation(username, "Username missing!", function(usernameValidationError, validatedUsername) {
				if (usernameValidationError) callback(usernameValidationError, null);
				else callback(null, validatedUsername)
			});
		};

		Lecture.prototype.validateCourseCode = function(courseCode, callback) {
			this.simpleValidation(courseCode, "Course code missing!", function(courseCodeValidationError, validatedCourseCode) {
				if (courseCodeValidationError) callback(courseCodeValidationError, null);
				else callback(null, validatedCourseCode);
			});
		};

		Lecture.prototype.validateDeviceId = function(deviceId, callback) {
			this.simpleValidation(deviceId, "Device ID missing", function(deviceIDValidationError, validatedDeviceId){
				if (deviceIDValidationError) callback(deviceIDValidationError, null);
				else callback(null, validatedDeviceId);
			});
		};

		Lecture.prototype.validateLectureCode = function(lectureCode, callback) {
			this.simpleValidation(lectureCode, "Lecture code missing!", function(lectureCodeValidationError, validatedLectureCode) {
				if (lectureCodeValidationError) callback(lectureCodeValidationError, null);
				else callback(null, validatedLectureCode);
			});
		};

		Lecture.prototype.validateUnderstandingLevel = function(understandingLevel, callback) {
			this.simpleValidation(understandingLevel, "Understanding level missing!", function(understandingLevelValidationError, validatedUnderstandingLevel) {
				if (understandingLevelValidationError) callback(understandingLevelValidationError, null);
				else callback(null, validatedUnderstandingLevel);
			});
		};
	}
	return Lecture;
})();