// lecturer.js

var bcrypt = require("bcrypt");
var async = require('async');

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
	// create the validation object
	validateUserForCreation = {
		username: function(usernamePartialCallback) {
			this.validateUsername(username, function(usernameValidationError, validatedUsername) {
				if (usernameValidationError) usernamePartialCallback(usernameValidationError, null);
				else usernamePartialCallback(null, validatedUsername);
			});
		},
		password: function(passwordPartialCallback) {
			this.validatePassword(password, function(passwordValidationError, hashedPassword) {
				if (passwordValidationError) passwordPartialCallback(passwordValidationError, null);
				else passwordPartialCallback(null, hashedPassword);
			});
		},
		lastname: function(lastnamePartialCallback) {
			this.validateLastName(lastname, function(lastnameValidationError, validatedLastname) {
				if (lastnameValidationError) lastnamePartialCallback(lastnameValidationError, null);
				else lastnamePartialCallback(null, validatedLastname);
			});
		},
		firstname: function(firstnamePartialCallback) {
			this.validatevalidateFirstName(firstname, function(firstNameValidationError, validatedFirstname){
				if (firstNameValidationError) firstnamePartialCallback(firstNameValidationError, null);
				else firstnamePartialCallback(null, validatedFirstname);
			});
		},
		title: function(titlePartialCallback) {
			this.validateTitle(title, function(titleValidationError, validatedTitle) {
				if (titleValidationError) titlePartialCallback(titleValidationError, null);
				else titlePartialCallback(null, validatedTitle);
			});	
		}
	};
	
	// call validation in parallel
	async.parallel(validatedUserForCreation, function(validationError, validationResult) {
		if (validationError) callback(validationError, null);
		else {
			// first check if there is a lecturer in the database with a 
			// username
			db.lecturers.find({username: validationResult["username"]}, function(dbError, lecturers) {
				if (dbError) callback(dbError, null);
				else {
					if ((lecturers) && (lecturers.length >= 1)) {
						var lecturerAlreadyExistsError = new Error("There already exists a lecturer with username " + validationResult["username"]);
						callback(lecturerAlreadyExistsError, null);
					} else {
						db.lecturers.save(validationResult, function(createError, createResult) {
							if (createError) callback(createError, null);
							else {
								if (!createResult) {
									var lecturerCreationFailedError = new Error("Lecturer creation failed!");
									callback(lecturerCreationFailedError, null);
								} else callback(null, createResult);
							}
						});
					}
				}
			});
		}
	});
};

Lecturer.prototype.validateUsername = function(username, callback) {
	this.simpleValidation(username, "Username Missing!", function(usernameValidationError, validatedUsername) {
		if (validationError) callback(usernameValidationError, null);
		else callback(null, validatedUsername);
	});
};

Lecturer.prototype.validatePassword = function(clearPassword, callback) {
	this.simpleValidation(clearPassword, "Password missing!", function(passwordValidationError, validatedPassword) {
		if (passwordValidationError) callback(passwordValidationError, null);
		else {
			bcrypt.genSalt(9, function(saltError, salt){
				if (saltError) callback(saltError, null);
				else {
					bcrypt.hash(clearPassword, salt, function(hashError, hashedPassworf) {
						if (hashError) callback(hashError, null);
						else callback(null, hashedPassword);
					});
				}
			});
		}
	});
};

Lecturer.prototype.validateLastName = function(lastname, callback) {
	this.simpleValidation(lastname, "Last name missing!", function(lastNameValidationError, validatedLastname){
		if (lastNameValidationError) callback(lastNameValidationError, null);
		else callback(null, validatedLastname);
	});
};

Lecturer.prototype.validatevalidateFirstName = function(firstname, callback) {
	this.simpleValidation(firstname, "First name missing!", function(firstnameValidationError, validatedFirstname){
		if (firstnameValidationError) callback(firstnameValidationError, null);
		else callback(null, validatedFirstname)
	});
};

Lecturer.prototype.validateTitle = function(title, callback) {
	this.simpleValidation(title, "Title missing!", function(titleValidationError, validatedTitle) {
		if (titleValidationError) callback(titleValidationError, null);
		else callback(null, validatedTitle);
	});
};

Lecturer.prototype.simpleValidation = function(value, errorMessage, callback) {
	if ((!value) || (value.length == 0)) {
		var missingValueError = new Error(errorMessage);
		callback(missingValueError, null);
	} else callback (null, value)
};

exports.Lecturer = Lecturer;