// lecturer.js

var bcrypt = require("bcrypt");

// set up the database
var dbUrl = "engageDB";
var db = require('mongojs').connect(dbUrl);

Lecturer = function(port, host) {
	console.log("Creating a Lecturer object with database on port " + port + " and host " + host);
};

Lecturer.prototype.authenticate = function(username, password, callback) {
	if (!username) {
		var usernameError = new Error("Error in lecturer login -- Missing username!");
		callback(usernameError, null);
	} else {
		if (!password) {
			var passwordError = new Error("Error in lecturer login -- Missing password!");
			callback(passwordError, null);
		} else {
			db.lecturers.find({username: username}, function(dbError, lecturers) {
				if (dbError) callback(dbError, null);
				else {
					if ((!lecturers) || (lecturers.length == 0)) {
						var lecturerCountError = new Error("Error in lecturer login -- There should be exactly one lecture with username " + username);
						callback(lecturerCountError, null);
					} else {
						var singleLecturer = lecturers[0];
						var hashedPassword = singleLecturer.password;
						bcrypt.compare(password, hashedPassword, function(passwordError, result) {
							if (passwordError) callback(passwordError, null);
							else {
								if (result) {
									var authenticationError = new Error("Lecturer authentication failed. The username and password do not correspond");
									callback(authenticationError, null);
								} else {
									callback(null, "Lecturer authentication successful!");
								}
							}
						});
					}
				}
			})	
		}
	}
};

Lecturer.prototype.create = function(username, password, lastname, firstname, title, callback) {
	
};

exports.Lecturer = Lecturer;