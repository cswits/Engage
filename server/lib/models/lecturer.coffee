# lecturer.coffee

bcrypt = require("bcrypt");
async = require('async');
ValidatorFactory = require('../handlers/validator').ValidatorFactory;
DataHandlerFactory = require('../handlers/data-handler').DataHandlerFactory;

exports.Lecturer = class Lecturer
	constructor: (io) ->
		@validator = ValidatorFactory.getValidatorInstance()
		@dataHandler = DataHandlerFactory.getDataHandlerInstance()
		@io = io

	deleteLecturer: (username, callback) =>
		@validateUsername username, (validationError, validatedUsername) =>
			if validationError?
				callback validationError, null
			else
				@dataHandler.deleteLecturer validatedUsername, (deleteError, deleteResult) =>
					if deleteError?
						failedUserDeletionError = new Error("Error deleting user #{validatedUsername}")
						callback failedUserDeletionError, null
					else
						deletionResult = 
							result: "Success!"
						callback null, deletionResult

	authenticate: (username, password, callback) =>
		validateUserForAuthentication =
			username: (usernamePartialCallback) =>
				@validateUsername username, (usernameValidationError, validatedUsername) =>
					if usernameValidationError?
						usernamePartialCallback usernameValidationError, null
					else
						usernamePartialCallback null, validatedUsername
			password: (passwordPartialCallback) =>
				@simpleValidation password, "Password missing!",(passwordValidationError, validatedPassword) =>
					if passwordValidationError?
						passwordPartialCallback passwordValidationError, null
					else
						passwordPartialCallback null, validatedPassword
		async.parallel validateUserForAuthentication, (validationError, validationResult) =>
			if validationError?
				callback validationError, null
			else
				@dataHandler.findLecturers validationResult.username, (findError, lecturers) =>
					if findError?
						callback findError, null
					else
						if not lecturers? or lecturers.length is 0
							undefinedLecturerError = new Error "There is no lecturer with username #{validationResult.username}"
							callback undefinedLecturerError, null
						else
							if lecturers.length != 1
								lecturerCountError = new Error "There should be exactly one lecturer with username #{validationResult.username}"
								callback lecturerCountError, null
							else
								singleLecturer = lecturers[0]
								hashedPassword = singleLecturer.password
								bcrypt.compare validationResult.password, hashedPassword, (compareError, compareResult) =>
									if compareError?
										callback compareError, null
									else
										if not compareResult?
											authenticationError = new Error "Authentication failed for lecturer #{validationResult.username}. Username and password do not correspond"
											callback authenticationError, null
										else
											@dataHandler.addSocket validationResult.username, @io, (addSocketError, addSocketResult) =>
												if addSocketError?
													callback addSocketError, null
												else
													authenticationResult = 
														result: "success!"
													callback null, authenticationResult



	create: (username, password, lastname, firstname, title, callback) =>
		validateForCreation = 
			username: (usernamePartialCallback) =>
				@validateUsername username, (usernameValidationError, validatedUsername) =>
					if usernameValidationError?
						usernamePartialCallback usernameValidationError, null
					else
						usernamePartialCallback null, validatedUsername
			password: (passwordPartialCallback) =>
				@validatePassword password, (passwordValidationError, hashedPassword) =>
					if passwordValidationError?
						passwordPartialCallback passwordValidationError, null
					else
						passwordPartialCallback null, hashedPassword
			lastname: (lastnamePartialCallback) =>
				@validateLastname lastname, (lastnameValidationError, validatedLastname) =>
					if lastnameValidationError?
						lastnamePartialCallback lastnameValidationError, null
					else
						lastnamePartialCallback null, validatedLastname
			firstname: (firstnamePartialCallback) =>
				@validateFirstname firstname, (firstNameValidationError, validatedFirstname) =>
					if firstNameValidationError?
						firstnamePartialCallback firstNameValidationError, null
					else
						firstnamePartialCallback null, validatedFirstname
			title: (titlePartialCallback) =>
				@validateTitle title, (titleValidationError, validatedTitle) =>
					if titleValidationError?
						titlePartialCallback titleValidationError, null
					else
						titlePartialCallback null, validatedTitle
		async.parallel validateForCreation, (validationError, validationResult) =>
			if validationError?
				callback validationError, null
			else
				@dataHandler.findLecturers validationResult.username, (findError, lecturers) =>
					if lecturers? and lecturers.length >= 1
						lecturerAlreadyExistsError = new Error "There already exits another lecturer in the database with username #{validationResult.username}"
						callback lecturerAlreadyExistsError, null
					else
						@dataHandler.addLecturer validationResult, (saveError, saveResult) =>
							if saveError?
								callback saveError, null
							else
								if not saveResult?
									lecturerCreationFailedError = new Error "Error creating a lecturer with username #{validationResult.username}"
									callback lecturerCreationFailedError, null
								else
									finalSaveResult = 
										result: "Success!"
									callback null, finalSaveResult

	validateUsername: (username, callback) =>
		@simpleValidation username, "Username missing!", (usernameValidationError, validatedUsername) =>
			if usernameValidationError?
				callback usernameValidationError, null
			else
				callback null, validatedUsername

	validateFirstname: (firstname, callback) =>
		@simpleValidation firstname, "First name missing!", (firstNameValidationError, validatedFirstname) =>
			if firstNameValidationError?
				callback  firstNameValidationError, null
			else
				callback null, validatedFirstname

	validateLastname: (lastname, callback) =>
		@simpleValidation lastname, "Last name missing!", (lastnameValidationError, validatedLastname) =>
			if lastnameValidationError?
				callback lastnameValidationError, null
			else
				callback null, validatedLastname

	validateTitle: (title, callback) =>
		@simpleValidation title, "Title missing!", (titleValidationError, validatedTitle) =>
			if titleValidationError?
				callback titleValidationError, null
			else
				callback null, validatedTitle

	validatePassword: (clearPassword, callback) =>
		@simpleValidation clearPassword, "Password missing!", (passwordValidationError, validatePassword) =>
			if passwordValidationError?
				callback passwordValidationError, null
			else
				bcrypt.genSalt 9, (saltError, salt) =>
					if saltError?
						callback saltError, null
					else
						bcrypt.hash clearPassword, salt, (hashError, hashedPassword) =>
							if hashError?
								callback hashError, null
							else
								callback null, hashedPassword

	simpleValidation: (value, errorMessage, callback) =>
		@validator.validate value, errorMessage, (validationError, validationResult) =>
			if validationError?
				callback validationError, null
			else
				callback null, validationResult