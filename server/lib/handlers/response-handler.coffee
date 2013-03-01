# response-handler.coffee

exports.ResponseHandlerFactory = class ResponseHandlerFactory
	_responseHandlerInstance = undefined
	@getResponseHandlerInstance: () =>
		_responseHandlerInstance ?= new ResponseHandler

	class ResponseHandler
		constructor: () ->

		handleResponse: (error, result, request, response) =>
			if error?
				@respondWithError error, response
			else
				@respondWithSuccess result, request, response

		respondWithError: (error, response) =>
			console.log "From inside respond with error"
			errorMessage = error.message
			response.writeHead 404, {"Content-Type": "text/plain"}
			response.end errorMessage

		respondWithSuccess: (result, request, response) =>
			console.log "From inside respond with success..."
			response.header "Access-Control-Allow-Origin", "*"
			response.header "Access-Control-Allow-Headers", "X-Requested-With"
			response.header "Content-Type", "application/json"
			response.header 'Charset', 'utf8'
			response.send request.query.callback + '(' + JSON.stringify(result) + ')'