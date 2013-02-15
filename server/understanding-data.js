UnderstandingData = function() {};
UnderstandingData.prototype.level = undefined;
UnderstandingData.prototype.timestamp = undefined;

UnderstandingData.prototype.setValue = function(level, ts, callback) {
	this.level = level;
	this.timestamp = ts;
	callback(null, true);
};

UnderstandingData.prototype.getLevel = function(callback){
	callback(null, this.level);
};

UnderstandingData.prototype.getTimestamp = function(callback) {
	callback(null, this.timestamp);
};

exports.UnderstandingData = UnderstandingData;