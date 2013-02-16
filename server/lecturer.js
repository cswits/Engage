// lecturer.js
var bcrypt = require("bcrypt");
var async = require('async');
var mongo = require('mongojs');
var Validator = require('./validator').Validator;

exports.Lecturer = (function(){
	function Lecturer(port, host) {
		console.log("Creating a Lecturer object with database on port %d and host %s", port, host);
		this.validator = new Validator();
		this.port = port;
		this.host = host;
		this.dbUrl = "engageDB";
		this.db = mongo.connect(this.dbUrl);
		
		Lecturer.prototype.authenticate = function(username, password, callback) {
			var validateUserForAuthentication = {
				username: function(usernamePartialCallback) {
					this.validateUsername(username, function(usernameValidationError, validatedUsername) {
						if (validationError) usernamePartialCallback(usernameValidationError, null);
						else usernamePartialCallback(null, validatedUsername);
					});
				},
				password: function(passwordPartialCallback) {
					this.simpleValidation(password, "Password Missing!", function(passwordValidationError, validatedPassword) {
						if (passwordValidationError) passwordPartialCallback(passwordValidationError, null);
						else passwordPartialCallback(null, validatedPassword);
					});
				}
			};

			async.parallel(validateUserForAuthentication, function(validationError, validationResult) {
				if (validationError) callback(validationError, null);
				else {
					this.db.lecturers.find({username: validationResult["username"]}, function(dbError, lecturers) {
						if (dbError) callback(dbError, null);
						else {
							if ((!lecturers) || (lecturers.length == 0)) {
								var lecturerCountError = new Error("There are no lecturer with username %s", validationResult["username"]);
								callback(lecturerCountError, null);
							} else {
								// there should be only lecturer with such username
								var singleLecturer = lecturers[0];
								var hashedPassword = singleLecturer["password"];
								bcrypt.compare(validationResult["password"], hashedPassword, function(passwordError, result) {
									if (passwordError) callback(passwordError, null);
									else {
										if (result) {
											var authenticationError = new Error("Lecturer authentication failed for %s. The username and password do not correspond!", validationResult["username"]);
											callback(authenticationError, null);
										} else {
											var authenticationResult = {
												result: "success!"
											};
											callback(null, authenticationResult);
										}
									}
								});
							}
						}
					});
				}
			});
		};

		Lecturer.prototype.delete = function(username, callback) {
			this.validateUsername(username, function(usernameValidationError, validatedUsername) {
				if (usernameValidationError) callback(usernameValidationError, null);
				else {
					this.db.lecturers.remove({username: validatedUsername}, function(dbError, dbResult) {
						if (dbError) callback(dbError, null);
						else {
							if (!dbResult) {
								var failedUserDeletionError = new Error("User %s deletion failed!", validatedUsername);
								callback(failedUserDeletionError, null);
							} else {
								var deletionResult = {
									result: "success!"
								};
								callback(null, deletionResult);
							}
						}
					});
				}
			});
		};

		Lecturer.prototype.create = function(username, password, lastname, firstname, title, callback) {
			// create the validation object
			var validateUserForCreation = {
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
					this.db.lecturers.find({username: validationResult["username"]}, function(dbError, lecturers) {
						if (dbError) callback(dbError, null);
						else {
							if ((lecturers) && (lecturers.length >= 1)) {
								var lecturerAlreadyExistsError = new Error("There already exists a lecturer with username %s", validationResult["username"]);
								callback(lecturerAlreadyExistsError, null);
							} else {
								this.db.lecturers.save(validationResult, function(createError, createResult) {
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
			this.validator.validate(value, errorMessage, function(validationError, validationResult) {
				if (validationError) callback(validationError, null);
				else callback(null, validationResult);
			});
		};
		
	}
	return Lecturer;
})();