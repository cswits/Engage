// response-handler.js

exports.ResponseHandler = (function(){
	"use strict";
	
	var responseHandlerInstance = null;
	
	var getInstance = function() {
		if (!responseHandlerInstance) {
			responseHandlerInstance = createInstance();
		}
		
		return responseHandlerInstance;
	};
	
	var createInstance = function() {
		return {
			handleResponse: function(error, result, request, response) {
				if (error) this.respondWithError(error, response);
				else this.respondWithSuccess(result, request, response);
			},
			respondWithError: function(error, response) {
				var errorMessage = error.message;
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.end(errorMessage);
			},
			respondWithSuccess: function(result, request, response) {
				response.header("Access-Control-Allow-Origin", "*");
				response.header("Access-Control-Allow-Headers", "X-Requested-With");
				response.header("Content-type", "application/json");
				response.header('Charset', 'utf8');
				response.send(request.query.callback + '(' + JSON.stringify(result) + ')');
			}
		};
	};
})();