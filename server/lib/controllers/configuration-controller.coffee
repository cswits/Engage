# configuration-controller.coffee

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