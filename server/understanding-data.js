UnderstandingData = function() {};
UnderstandingData.prototype.level = undefined;
UnderstandingData.prototype.timestamp = undefined;

UnderstandingData.prototype.setValue = function(level, ts) {
	this.level = level;
	this.timestamp = ts;	
};

exports.UnderstandingData = UnderstandingData;