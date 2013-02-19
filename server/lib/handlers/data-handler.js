var mongo = require('mongojs');

exports.DataHandler = (function() {
	this.dataHandlerInstance = null;
	
	var getInstance = function(port, host) {
		if (!this.dataHandlerInstance) {
			this.dataHandlerInstance = createInstance(port, host);
		}
		
		return this.dataHandlerInstance;
	}
	
	var createInstance = function(dbPort, dbHost) {
		var port = dbPort;
		var host = dbHost;
		var dbUrl = "engageDB";
		var db = mongo.connect(dbUrl);
		return {
			findData: function(bucketName, criteria, callback) {
				db[bucketName].find(criteria, function(findError, findResult) {
					callback(findError, findResult);
				});
			},
			saveData: function(bucketName, data, callback) {
				db[bucketName].save(data, function(saveError, saveResult){
					callback(saveError, saveResult);
				});
			}
		}
	}
})();