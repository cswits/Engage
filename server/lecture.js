// set up the database
var dbUrl = "engageDB";
var db = require('mongojs').connect(dbUrl);

Lecture = function(port, host) {
	console.log("Creating a lecture object with database access on port " + port + " and host " + host);
};

// Will keep track of the lecture codes created for a given course
// this attributes will be an associative array
Lecture.prototype.usedLectureCodes = [];

Lecture.prototype.createLectureCode = function(courseCode, callback) {
	var lectureCode = "";
	while (lectureCode.length < 8) {
		lectureCode = Math.random().toString(36).substr(2);
		lectureCode = lectureCode.substr(0, 8);
		if (lectureCode in usedLectureCodes) {
			lectureCode = ""
		}
	}
	usedLectureCodes[courseCode].push(lectureCode);
	callback(null, lectureCode);
};

exports.Lecture = Lecture