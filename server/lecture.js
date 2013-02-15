// lecture.js

var async = require('async');

// set up the database
var dbUrl = "engageDB";
var db = require('mongojs').connect(dbUrl);

// loading other objects
var Validator = require('./validator').Validator;
var validator = new Validator();

var UnderstandingData = require('./understanding-data').UnderstandingData;


Lecture = function(port, host) {
	console.log("Creating a lecture object with database access on port " + port + " and host " + host);
};

// Note to self: caution about the way you access array data

// Associative array keeping track of the lecture codes already generated for a given course
Lecture.prototype.usedLectureCodes = {};

// Array keeping track of all device Ids
Lecture.prototype.currentDeviceIds = {};

// Array keeping all the current lecture codes
Lecture.prototype.currentLectureCodes = [];

// understanding levels as an associative array
// for each lecture code there is an associative array that stores all the submissions
Lecture.prototype.understandingLevels = {};

Lecture.prototype.getNewLectureCode = function(courseCode, callback) {
	this.validateCourseCode(courseCode, function(validationError, validationResult) {
		if (validationError) callback(validationError, null);
		else {
			var lectureCode = "";
			while(lectureCode.length < 8) {
				lectureCode = Math.random().toString(36).substr(2);
				lectureCode = lectureCode.substr(0,8);
				if (this.usedLectureCodes.indexOf(lectureCode) != -1) lectureCode = "";
			}
			this.usedLectureCodes[validationResult].push(lectureCode);
			var newLectureCodeResult  = {
				lectureCode: lectureCode
			};
			callback(null, newLectureCodeResult);
		}
	});
};

Lecture.prototype.joinLecture = function(lectureCode, deviceID, callback){
	var validateForJoinLecture = {
		deviceID: function(deviceIDPartialCallback) {
			this.validateDeviceId(deviceID, function(deviceIDValidationError, validatedDeviceID) {
				if (deviceIDValidationError) deviceIDPartialCallback(deviceIDValidationError, null);
				else deviceIDPartialCallback(null, validatedDeviceID);
			});
		},
		lectureCode: function(lectureCodePartialCallback) {
			this.validateLectureCode(lectureCode, function(lectureCodeValidationError, validatedLectureCode) {
				if (lectureCodeValidationError) lectureCodePartialCallback(lectureCodeValidationError, null);
				else lectureCodePartialCallback(null, validatedLectureCode);
			});
		}
	};
	
	async.parallel(validateForJoinLecture, function(validationError, validationResult){
		if (validationError) callback(validationError, null);
		else {
			if (this.currentLectureCodes.indexOf(lectureCode) == -1) {
				var wrongLectureCodeError = new Error("Lecture code does not exist");
				callback(wrongLectureCodeError, null);
			} else {
				this.currentDeviceIds[validationResult["lectureCode"]].push(validationResult["deviceID"]);
				var lectureResult = {
					lectureCode: validationResult["lectureCode"],
					time: new Date().toTimeString()
				};
				callback(null, lectureResult);
			}
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
				var lectureDataError = new Error("Lecture code does not exist!");
				callback(lectureDataError, null);
			} else {
				var deviceData = lectureData[validationResult["deviceID"]];
				if (!deviceData) {
					var deviceDataError = new Error("Device Id does not exist!");
					callback(deviceDataError, null);
				} else {
					deviceData.push(understandingData);
					var submitDataResult = {
						result: "Success!"
					};
					callback(null, submitDataResult);
				}
			}
		}
	});
};

Lecture.prototype.endLecture = function(lectureCode, callback) {
	this.validateLectureCode(lectureCode, function(lectureCodeValidationError, validatedLectureCode) {
		if (lectureCodeValidationError) callback(lectureCodeValidationError, null);
		else {
			if (this.currentLectureCodes.indexOf(validatedLectureCode) == -1) {
				var wrongLectureCodeError =  new Error("Lecture code does not exist");
				callback(wrongLectureCodeError, null);
			} else {
				this.currentLectureCodes = [];
				var lectureDevicesIndex = this.currentDeviceIds.indexOf(validatedLectureCode);
				if (lectureDevicesIndex != -1) this.currentDeviceIds.splice(lectureDevicesIndex, 1);
				var endLectureResult = {
					result: "Success!"
				};
				callback(null, endLectureResult);
			}
		}
	});
};

Lecture.prototype.leaveLecture = function(lectureCode, deviceId, callback) {
	var validateForLeaveLecture = {
		lectureCode: function(lectureCodePartialCallback) {
			this.validateLectureCode(lectureCode, function(lectureCodeValidationError, validatedLectureCode) {
				if (lectureCodeValidationError) lectureCodePartialCallback(lectureCodeValidationError, null);
				else lectureCodePartialCallback(null, validatedLectureCode);
			});
		},
		deviceID: function(deviceIDPartialCallback) {
			this.validateDeviceId(deviceId, function(deviceIDValidationError, validatedDeviceID){
				if (deviceIDValidationError) deviceIDPartialCallback(deviceIDValidationError, null);
				else deviceIDPartialCallback(null, validatedDeviceID);
			});
		}
	};
	
	async.parallel(validateForLeaveLecture, function(validationError, validationResult) {
		if (validationError) callback(validationError, null);
		else {
			var allLectureDevices = this.currentDeviceIds[validationResult["lectureCode"]];
			if (!allLectureDevices) {
				var unknownLectureCodeError = new Error("Lecture code unknown!");
				callback(unknownLectureCodeError, null);
			} else {
				var deviceIndex = allLectureDevices.indexOf(validationResult["deviceID"]);
				if (deviceIndex == -1) {
					var unknownDeviceError = new Error("Device Unknown!");
					callback(unknownDeviceError, null);
				} else {
					allLectureDevices.splice(deviceIndex, 1);
					if (allLectureDevices.length == 0) {
						var curIndex = this.currentDeviceIds.indexOf(validationResult["lectureCode"]);
						if (curIndex != -1) {
							this.currentDeviceIds.splice(curIndex, 1);
						}
					}
					var leaveResult = {
						result: "Success!"
					};
					callback(null, leaveResult);
				}
			}
		}
	});
};

Lecture.prototype.simpleValidation = function(value, errorMessage, callback) {
	validator.validate(value, errorMessage, function(validationError, validationResult) {
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
}

exports.Lecture = Lecture;