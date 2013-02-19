var mongo = require('mongojs');

exports.DataHandler = (function () {
	function DataHandler(port, host) {
		console.log("Creating a data handler object with database on port %d and host %s", port, host);
		this.port = port;
		this.host = host;
		this.dbUrl = "engageDB";
		this.db = mongo.connect(this.dbUrl);
		
		// finding data from the database
		DataHandler.prototype.findData = function(bucketName, criteria, callback) {
			this.db[bucketName].find(criteria, function(findError, findResult) {
				callback(findError, findResult);
			});
		};
		
		// Adding data to the database
		DataHandler.prototype.saveData = function(bucketName, data, callback) {
			this.db[bucketName].save(data, function(saveError, saveResult) {
				callback(saveError, saveResult);
			});
		};
		
	}
	return DataHandler;
})();