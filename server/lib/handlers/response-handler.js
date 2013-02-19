exports.ResponseHandler = (function() {
	function ResponseHandler() {
		ResponseHandler.prototype.handleResponse = function(error, result, request, response) {
			if (error) this.respondWithError(error, response);
			else respondWithSuccess(result, request, response);
		};
		
		ResponseHandler.prototype.respondWithError = function(error, response) {
			var errorMessage = error.message;
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.end(errorMessage);
		};

		ResponseHandler.prototype.respondWithSuccess = function(result, request, response) {
			response.header("Access-Control-Allow-Origin", "*");
			response.header("Access-Control-Allow-Headers", "X-Requested-With");
			response.header("Content-type", "application/json");
			response.header('Charset', 'utf8');
			response.send(request.query.callback + '(' + JSON.stringify(result) + ')');
		};
	}
	return ResponseHandler;
})();