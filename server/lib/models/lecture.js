// lecture.js

var async = require('async');
var Validator = require('../handlers/validator').Validator;
var DataHandler = require('../handlers/data-handler').DataHandler;
var UnderstandingData = require('../handlers/understanding-data').UnderstandingData;


exports.Lecture = (function(){
	function Lecture(port, host) {
		this.validator = new Validator();
		this.dataHandler = DataHandler.getInstance(port, host);
				
		// Associative array keeping track of the lecture codes already generated for a given course
		// this.usedLectureCodes = {};

		// Array keeping track of all device Ids
		this.currentDeviceIds = {};

		// Array keeping all the current lecture codes
		this.currentLectureCodes = [];

		// understanding levels as an associative array
		// for each lecture code there is an associative array that stores all the submissions
		this.understandingLevels = {};
		
		// generate new lecture code
		Lecture.prototype.getNewLectureCode = function(courseCode, callback) {
			this.validateCourseCode(courseCode, function(validationError, validatedCourseCode) {
				if (validationError) callback(validationError, null);
				else {
					this.dataHandler.generateNewLectureCode(validatedCourseCode, function(lectureCodeError, lectureCodeResult){
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
		
		Lecture.prototype.submitUnderstandingLevel = function(lectureCode, deviceId, timestamp, callback) {
			var validateForUnderstanding = {
				lectureCode: function(lectureCodePartialCallback) {
					this.validateLectureCode(lectureCode, function(lectureCodeValidationError, validatedLectureCode) {
						if (lectureCodeValidationError) lectureCodePartialCallback(lectureCodeValidationError, null);
						else lectureCodePartialCallback(null, validatedLectureCode);
					});
				},
				deviceID: function(deviceIDPartialCallback) {
					this.validateDeviceId(deviceId, function(deviceIDValidationError, validatedDeviceId){
						if (deviceIDValidationError) deviceIDPartialCallback(deviceIDValidationError, null);
						else deviceIDPartialCallback(null, validatedDeviceId);
					});
				},
				understandingLevel: function(understandingLevelPartialCallback) {
					this.validateUnderstandingLevel(understandingLevel, function(understandingLevelValidationError, validatedUnderstandingLevel){
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

					var lectureData = this.understandingLevels[validationResult["lectureCode"]];
					if (!lectureData) {
						var wrongLectureCodeError = new Error("Lecture code " + validationResult["lectureCode"] + " does not exist");
						callback(null, wrongLectureCodeError, null);
					} else {
						var deviceData = lectureData[validationResult["deviceID"]];
						if (!deviceData) {
							var wrongDeviceIDError = new Error("Device ID " + validationResult["deviceID"] + " does not exist");
							callback(wrongDeviceIDError, null);
						} else {
							deviceData.push(understandingData);
							var submitResult = {
								result: "Success!"
							};
							callback(null, submitResult);
						}
					}
				}
			});
		};
		
		Lecture.prototype.refreshAverageUnderstandingLevel = function(lectureCode, callback) {
			this.validateLectureCode(lectureCode, function(lectureCodeValidationError, validatedLectureCode){
				if (lectureCodeValidationError) callback(lectureCodeValidationError, null);
				else {
					var allLectureDevices = this.currentDeviceIds[validatedLectureCode];
					if (!allLectureDevices) {
						var wrongLectureCodeError = new Error("Lecture code " + validatedLectureCode + " does not exist");
						callback(wrongLectureCodeError, null);
					} else {
						async.forEach(...);
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