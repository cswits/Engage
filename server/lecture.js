// lecture.js

// set up the database
var dbUrl = "engageDB";
var db = require('mongojs').connect(dbUrl);

Lecture = function(port, host) {
	console.log("Creating a lecture object with database access on port " + port + " and host " + host);
};

// Associative array keeping track of the lecture codes already generated for a given course
Lecture.prototype.usedLectureCodes = [];

// Array keeping track of all device Ids
Lecture.prototype.currentDeviceIds = [];

// Array keeping all the current lecture codes
Lecture.prototype.currentLectureCodes = [];

Lecture.prototype.getNewLectureCode = function(courseCode, callback) {
	if (!courseCode) {
		var missingCourseCodeError = new Error("Course code missing!");
		callback(missingCourseCode, null);
	} else {
		var lectureCode = "";
		while(lectureCode.length < 8) {
			lectureCode = Math.random().toString(36).substr(2);
			lectureCode = lectureCode.substr(0, 8);
			if (this.usedLectureCodes.indexOf(lectureCode) != -1) lectureCode = "";
		}
		this.usedLectureCodes[courseCode].push(lectureCode);
		var newLectureCodeResult = {
			lectureCode: lectureCode
		};
		callback(null, newLectureCodeResult);
	}
};

Lecture.prototype.joinLecture = function(lectureCode, deviceID, callback){
	if (!deviceID) {
		var undefinedDeviceIDError = new Error("Device ID missing!");
		callback(undefinedDeviceIDError, null);
	} else {
		if (!lectureCode) {
			var undefinedLectureCodeError = new Error("Lecture code missing!");
			callback(undefinedLectureCodeError, null);
		} else {
			if (this.currentLectureCodes.indexOf(lectureCode) == -1) {
				var wrongLectureCodeError = new Error("Lecture code does not exist");
				callback(wrongLectureCodeError, null);
			} else {
				this.currentDeviceIds[lectureCode].push(deviceId);
				var lectureResult = {
					lectureCode: lectureCode,
					time: new Date().toTimeString()
				};
				callback(null, lectureResult);
			}
		}
	}
};

Lecture.prototype.submitUnderstandingLevel = function(lectureCode, deviceID, understandingLevel, callback) {
	if (!lectureCode) {
		var missingLectureCodeError = new Error("Lecture code missing!");
		callback(missingLectureCodeError, null);
	} else {
		if (!deviceID) {
			var missingDeviceIDError = new Error("Device Id missing!");
			callback(missingDeviceIDError, null);
		} else {
			if (!understandingLevel) {
				var missingUnderstandingLevelError = new Error("");
			}
		}
	}
};

Lecture.prototype.endLecture = function(lectureCode, callback) {
	if (!lectureCode) {
		var undefinedLectureCodeError = new Error("Lecture code missing!");
		callback(undefinedLectureCodeError, null);
	} else {
		if (this.currentLectureCodes.indexOf(lectureCode) == -1) {
			var wrongLectureCodeError = new Error("Lecture code does not exist");
			callback(wrongLectureCodeError, null);
		} else {
			this.currentLectureCodes = [];
			var lectureDevicesIndex = this.currentDeviceIds.indexOf(lectureCode);
			if (lectureDevicesIndex != -1) {
				this.currentDeviceIds.splice(lectureDevicesIndex, 1);
			}
			// archive data in the database
			var endLectureResult = {
				result: "Success!"
			};
			callback(null, endLectureResult);
		}
	}
};

Lecture.prototype.leaveLecture = function(lectureCode, deviceId, callback) {
	if (!lectureCode) {
		var undefinedLectureCodeError = new Error("Lecture code missing!");
		callback(undefinedLectureCodeError, null);
	} else {
		if (!deviceId) {
			var undefinedDeviceIDError = new Error("Device ID missing");
			callback(undefinedDeviceIDError, null);
		} else {
			var allLectureDevices = this.currentDeviceIds[lectureCode];
			if (!allLectureDevices) {
				var unknownLectureCodeError = new Error("Unknown lecture code");
				callback(unknwonLectureCodeError, null);
			} else {
				var deviceIndex = allLectureDevices.indexOf(deviceId);
				if (deviceIndex == -1) {
					var unknownDeviceIdError = new Error("Unknown Device ID");
					callback(unknownDeviceIdError, null);
				} else {
					allLectureDevices.splice(deviceIndex, 1);
					if (allLectureDevices.length == 0) {
						curIndex = this.currentDeviceIds.indexOf(lectureCode);
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
	}
};

exports.Lecture = Lecture;