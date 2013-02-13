// set up the database
var dbUrl = "engageDB";
var db = require('mongojs').connect(dbUrl);

Lecture = function(port, host) {
	console.log("Creating a lecture object with database access on port " + port + " and host " + host);
};

// Associative array keeping track of the lecture codes already generated for a given course
Lecture.prototype.usedLectureCodes = [];

// Array keeping all the current lecture codes
Lecture.prototype.currentLectureCodes = [];

Lecture.prototype.createLectureCode = function(courseCode, callback) {
	var lectureCode = "";
	while (lectureCode.length < 8) {
		lectureCode = Math.random().toString(36).substr(2);
		lectureCode = lectureCode.substr(0, 8);
		if (lectureCode in usedLectureCodes[courseCode]) {
			lectureCode = "";
		}
	}
	usedLectureCodes[courseCode].push(lectureCode);
	callback(null, lectureCode);
};

Lecture.prototype.joinLecture = function(lectureCode, callback) {
	if (lectureCode in currentLectureCodes) {
		var today = new Date();
		var todayYear = today.getFullYear();
		var todayDate = today.getDate();
		var todayMonth = today.getMonth();
		var todayTime = today.getTime();
		
		var lectureResult = {};
		
	} else {
		var incorrectLectureCodeError = new Error("This lecture code does not exist");
		callback(incorrectLectureCodeError, null);
	}
};

exports.Lecture = Lecture