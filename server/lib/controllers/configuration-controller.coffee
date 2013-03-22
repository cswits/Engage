# configuration-controller.coffee

# a version number must be added to the lecturer login and the student join lecture.
# if that version is not greater or equal to the oldest version in the db, the request is rejected

Configuration = require('../models/configuration').Configuration
ResponseHandlerFactory = require('../handlers/response-handler').ResponseHandlerFactory

exports.ConfigurationController = class ConfigurationController
	constructor: () ->
		@configuration = new Configuration
		console.log "Creating a configuration controller..."
	
	setOldestVersion: (request, response) =>
		console.log "User configuring Engage..."
		
		version = request.query.version
		@configuration.setOldestVersion version, (versionError, versionResult) =>
			@responseHandler.handleResponse versionError, versionResult, request, response