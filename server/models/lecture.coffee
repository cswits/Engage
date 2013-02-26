async = require('async');
ValidatorFactory = require('../handlers/validator').ValidatorFactory;
DataHandlerFactory = require('../handlers/data-handler').DataHandlerFactory;

exports.Lecture = class Lecture
	constructor: () ->
		@validator = ValidatorFactory.getValidatorInstance()
		@dataHandler = DataHandlerFactory.getDataHandlerInstance()

	getNewLectureCode: (courseCode, lecturerUsername, callback) =>
		console.log "Creating a new lecture code..."

	joinLecture: (lectureCode, deviceId, callback) =>
		console.log "joining a lecture..."

	endLecture: (lectureCode, callback) =>
		console.log "ending a lecture..."

	leaveLecture: (lectureCode, deviceId, callback) =>
		console.log "leaving a lecture..."
