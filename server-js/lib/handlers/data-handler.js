// data-hanler.js

var mongo = require('mongojs');

exports.DataHandler = (function() {
	"use strict";
	
	var dataHandlerInstance = null;

	var getInstance = function(port, host) {
		if (!dataHandlerInstance) {
			dataHandlerInstance = createInstance(port, host);
		}

		return dataHandlerInstance;
	};

	var createInstance = function(dbPort, dbHost) {
		var port = dbPort;
		var host = dbHost;
		var dbUrl = "engageDB";
		var db = mongo.connect(dbUrl);

		// usedLectureCodes is an associative array
		// key: course code
		// value: [lecture codes]
		var usedLectureCodes = {};
		
		// currentLectureCodes is an array containing
		// all the lecture codes currently in use
		var currentLectureCodes = [];
		
		// currentDeviceIds is an associative array
		// key: lecture code
		// value: [device Ids]
		var currentDeviceIds = {};
		
		// understanding levels as an associative array
		// key: lecture code
		// value: another associative array with
		// key: deviceId
		// value: [understanding levels]
		var understandingLevels = {};
		
		// socketMap is an associative array
		// key: username
		// value: socket
		var socketMap = {};
		
		// currentlyLecturing is an associative array
		// key: lecture code
		// value: lecturer username
		var currentlyLecturing = {};

		return {
			addSocket: function(username, io, callback) {
				if (io) {
					io.sockets.on('connection', function(socket) {
						socketMap[username] = socket;
					});
				}
				callback(null, true);
			},
			findLecturers: function(lecturerUsername, callback) {
				var criteria = {username: lecturerUsername};
				this.findData("lecturers", criteria, function(findError, findResult) {
					callback(findError, findResult);
				});
			},
			addLecturer: function(data, callback) {
				this.saveData("lecturers", data, function(addError, addResult) {
					callback(addError, addResult);
				});
			},
			deleteLecturer: function(lecturerUsername, callback) {
				var criteria = {username: lecturerUsername};
				this.deleteData("lecturers", criteria, function(deleteError, deleteResult){
					callback(deleteError, deleteResult);
				});
			},
			findData: function(bucketName, criteria, callback) {
				db[bucketName].find(criteria, function(findError, findResult) {
					callback(findError, findResult);
				});
			},
			saveData: function(bucketName, data, callback) {
				db[bucketName].save(data, function(saveError, saveResult){
					callback(saveError, saveResult);
				});
			},
			deleteData: function(bucketName, criteria, callback){
				db[bucketName].remove(criteria, function(removeError, removeResult) {
					callback(removeError, removeResult);
				});
			},
			generateNewLectureCode: function(courseCode, username, callback) {
				var lectureCode = "";
				while(lectureCode.length < 8) {
					lectureCode = Math.random().toString(36).substr(2);
					lectureCode = lectureCode.substr(0, 8);
					var existingUsedLectureCodes = usedLectureCodes[courseCode];
					if (!existingUsedLectureCodes) {
						usedLectureCodes[courseCode] = [lectureCode];
						break;
					} else {
						if (existingUsedLectureCodes.indexOf(lectureCode) == -1) {
							existingUsedLectureCodes.push(lectureCode);
							break;
						} else lectureCode = "";
					}
				}
				currentlyLecturing[lectureCode] = username;
				callback(null, lectureCode);
			},
			mapLectureCodeToStudent: function(lectureCode, deviceId, callback) {
				if (currentLectureCodes.indexOf(lectureCode) == -1) {
					var wrongLectureCodeError = new Error("Lecture code does not exist");
					callback(wrongLectureCodeError, null);
				} else {
					currentDeviceIds[lectureCode].push(deviceId);
					var currentTS = new Date().toTimeString();
					var result = {
						lectureCode: lectureCode,
						time: currentTS
					};
					callback(null, result);
				}
			},
			endLecture: function(lectureCode, callback) {
				if (currentLectureCodes.indexOf(lectureCode) == -1) {
					var wrongLectureCodeError = new Error("Lecture code does not exist");
					callback(wrongLectureCodeError, null);
				} else {
					currentLectureCodes = [];
					delete currentDeviceIds[lectureCode];
					var endLectureResult = {
						result: "Success!"
					};
					callback(null, endLectureResult);
				}
			},
			unmapLectureCodeFromStudent: function(lectureCode, deviceId, callback) {
				var allLectureDevices = currentDeviceIds[lectureCode];
				if (!allLectureDevices) {
					var unknownLectureCodeError = new Error("Lecture code unknown!");
					callback(unknownLectureCodeError, null);
				} else {
					var deviceIndex = allLectureDevices.indexOf(deviceId);
					if (deviceIndex === -1) {
						var unknownDeviceError = new Error("Device unknown!");
						callback(unknownDeviceError, null);
					} else {
						allLectureDevices.splice(deviceIndex, 1);
						if (allLectureDevices.length === 0) delete currentDeviceIds[lectureCode];
						var leaveResult = {
							result: "Success!"
						};
						callback(null, leaveResult);
					}
				}
			},
			addUnderstandingLevel: function(lectureCode, deviceId, understandingData, callback) {
				var lectureData = understandingLevels[lectureCode];
				if (!lectureData) {
					var wrongLectureCodeError = new Error("Lecture code %s unknown for understanding levels", lectureCode);
					callback(wrongLectureCodeError, null);
				} else {
					var deviceData = lectureData[deviceId];
					if (!deviceData) {
						var wrongDeviceIDError = new Error("Devicd ID %s unknown for understanding levels", deviceId);
						callback(wrongDeviceIDError, null);
					} else {
						deviceData.push(understandingData);
						var understandingRecord = {
							lectureCode: lectureCode,
							deviceId: deviceId,
							timestamp: understandingData.getTimestamp(),
							undertandingLevel: understandingData.getLevel()
						};
						this.saveData("understandings", understandingRecord, function(error, result){
							if (error) callback(error, null);
							else {
								if (!result) {
									var saveFailedError = new Error("Saving understanding level failed");
									callback(saveFailedError, null);
								} else {
									var addResult = {
										result: "Success!"
									};
									// send understanding average to lecturer client
									var lecturerUsername =  currentlyLecturing[lectureCode];
									// only try to send it if the lecturer username exists
									if (lecturerUsername) {
										var lecturerSocket = socketMap[lecturerUsername];
										// extract the averages
										var recentUnderstandings = [];
										var allUnderstandings = understandingLevels[lectureCode];
										// loop over this associative array and extract all the last elements
										for (var currentDevice in allUnderstandings) {
											var deviceUnderstandings = allUnderstandings[currentDevice];
											var latestUnderstandingData = deviceUnderstandings[deviceUnderstandings.length - 1];
											var currentLevel = latestUnderstandingData.getLevel();
											var levelAsNumber = Number(currentLevel);
											recentUnderstandings.push(levelAsNumber);
										}
										var averageData = {
											averages: recentUnderstandings
										};
										lecturerSocket.emit("averages", averageData);
									}
									callback(null, addResult);
								}
							}
						});
					}
				}
			}
		};
	};
})();