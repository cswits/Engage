// lecturer.js

var bcrypt = require("bcrypt");
var async = require('async');
var Validator = require('../handlers/validator').Validator;
var DataHandler = require('../handlers/data-handler').DataHandler;

exports.Lecturer = (function() {
	"use strict";

	function Lecturer(port, host, io) {
		this.validator = Validator.getInstance();
		this.dataHandler = DataHandler.getInstance(port, host);
		this.ioObject = io;
	}

	Lecturer.prototype.deleteLecturer = function(username, callback) {
		this.validateUsername(username, function(usernameValidationError, validatedUsername) {
			if (usernameValidationError) callback(usernameValidationError, null);
			else {
				this.dataHandler.deleteLecturer(validatedUsername, function(deleteError, deleteResult) {
					if (deleteError) callback(deleteError, null);
					else {
						if (!deleteResult) {
							var failedUserDeletionError = new Error("Error deleting user %s", validatedUsername);
							callback(failedUserDeletionError, null);
						} else {
							var deletionResult = {
								result: "Success!"
							};
							callback(null, deletionResult);
						}
					}
				});
			}
		});
	};

	Lecturer.prototype.authenticate = function(username, password, callback) {
		var validateUserForAuthentication = {};
		validateUserForAuthentication.username = function(usernamePartialCallback) {
			this.validateUsername(username, function(usernameValidationError, validatedUsername) {
				if (usernameValidationError) usernamePartialCallback(usernameValidationError, null);
				else usernamePartialCallback(null, validatedUsername);
			});
		};
		validateUserForAuthentication.password = function(passwordPartialCallback) {
			this.simpleValidation(password, "Password Missing!", function(passwordValidationError, validatedPassword) {
				if (passwordValidationError) passwordPartialCallback(passwordValidationError, null);
				else passwordPartialCallback(null, validatedPassword);
			});
		};

		async.parallel(validateUserForAuthentication, function(validationError, validationResult) {
			if (validationError) callback(validationError, null);
			else {
				this.dataHandler.findLecturers(validationResult.username, function(findError, lecturers) {
					if (findError) callback(findError, null);
					else {
						if ((!lecturers) || (lecturers.length === 0)) {
							var undefinedLecturerError = new Error("There is no lecturer with username %s", validationResult.username);
							callback(undefinedLecturerError, null);
						} else {
							if (lecturers.length != 1) {
								var lecturerCountError = new Error("There should be exactly one lecturer with username %s", validationResult.username);
								callback(lecturerCountError, null);
							} else {
								var singleLecturer = lecturers[0];
								var hashedPassword = singleLecturer.password;
								bcrypt.compare(validationResult.password, hashedPassword, function(compareError, compareResult) {
									if (compareError) callback(compareError, null);
									else {
										if (!compareResult) {
											var authenticationError = new Error("Authenticaton failed for lecturer %s. The username and password do not correspond!", validationResult.username);
											callback(authenticationError, null);
										} else {
											this.dataHandler.addSocket(validationResult.username, this.ioObject, function(addSocketError, addSocketResult) {
												if (addSocketError) callback(addSocketError, null);
												else {
													var authenticationResult = {
														result: "Success!"
													};
													callback(null, authenticationResult);
												}
											});												
										}
									}
								});
							}
						}
					}
				});
			}
		});			
	};

	Lecturer.prototype.create = function(username, password, lastname, firstname, title, callback) {
		var validateUserForCreation = {};
		validateUserForCreation.username = function(usernamePartialCallback) {
			this.validateUsername(username, function(usernameValidationError, validatedUsername) {
				if (usernameValidationError) usernamePartialCallback(usernameValidationError, null);
				else usernamePartialCallback(null, validatedUsername);
			});
		};
		validateUserForCreation.password = function(passwordPartialCallback) {
			this.validatePassword(password, function(passwordValidationError, hashedPassword) {
				if (passwordValidationError) passwordPartialCallback(passwordValidationError, null);
				else passwordPartialCallback(null, hashedPassword);
			});
		};
		validateUserForCreation.lastname = function(lastnamePartialCallback) {
			this.validateLastName(lastname, function(lastnameValidationError, validatedLastname) {
				if (lastnameValidationError) lastnamePartialCallback(lastnameValidationError, null);
				else lastnamePartialCallback(null, validatedLastname);
			});
		};
		validateUserForCreation.firstname = function(firstnamePartialCallback) {
			this.validatevalidateFirstName(firstname, function(firstNameValidationError, validatedFirstname){
				if (firstNameValidationError) firstnamePartialCallback(firstNameValidationError, null);
				else firstnamePartialCallback(null, validatedFirstname);
			});
		};
		validateUserForCreation.title = function(titlePartialCallback) {
			this.validateTitle(title, function(titleValidationError, validatedTitle) {
				if (titleValidationError) titlePartialCallback(titleValidationError, null);
				else titlePartialCallback(null, validatedTitle);
			});
		};

			// call validation in parallel
		async.parallel(validateUserForCreation, function(validationError, validationResult) {
			if (validationError) callback(validationError, null);
			else {
				this.dataHandler.findLecturers(validationResult.username, function(findError, lecturers) {
					if (findError) callback(findError, null);
					else {
						if ((lecturers) && (lecturers.length >= 1)) {
							var lecturerAlreadyExistsError = new Error("There already exists a lecturer with username %s", validationResult.username);
							callback(lecturerAlreadyExistsError, null);
						} else {
							this.dataHandler.addLecturer(validationResult, function(saveError, saveResult) {
								if (saveError) callback(saveError, null);
								else {
									if (!saveResult) {
										var lecturerCreationFailedError = new Error("Error creating a lecturer with username %s", validationResult.username);
										callback(lecturerCreationFailedError, null);
									}
									else {
										var finalSaveResult = {
											result: "Success!"
										};
										callback(null, finalSaveResult);
									}
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
			if (usernameValidationError) callback(usernameValidationError, null);
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
						bcrypt.hash(clearPassword, salt, function(hashError, hashedPassword) {
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
			else callback(null, validatedFirstname);
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

	return Lecturer;
})();