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
	callback(null, null);
};

exports.Lecture = Lecture