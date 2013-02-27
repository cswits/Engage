# lecturer-controller.coffee

Lecturer = require('../models/lecturer').Lecturer;
ResponseHandlerFactory = require('../handlers/response-handler').ResponseHandlerFactory;

exports.LecturerController = class LecturerController
	constructor: (io) ->
		@lecturer = new Lecturer io
		@responseHandler = ResponseHandler.getResponseHandlerInstance()

	authenticateLecturer: (request, response) =>
		console.log "Lecturer logging into the system..."

		lecturerUsername = request.body.username
		lecturerPassword = request.body.password

		@lecturer.authenticate lecturerUsername, lecturerPassword, (authenticationError, authenticationResult) =>
			@responseHandler.handleResponse authenticationError, authenticationResult, request, response

	createLecturer: (request, response) =>
		console.log "Creating a new lecturer into the Engage database..."

		username = request.body.username
		password = request.body.password
		lastname = request.body.lastname
		firstname = request.body.firstname
		title = request.body.title

		@lecturer.create username, password, lastname, firstname, title, (createError, createResult) =>
			@responseHandler.handleResponse createError, createResult, request, response

	deleteLecturer: (request, response) =>
		console.log "Deleting an existing lecturer from the Engage database ..."

		username = request.params.username

		@lecturer.deleteLecturer username, (deleteError, deleteResult) =>
			@responseHandler.handleResponse deleteError, deleteResult, request, response