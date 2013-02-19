exports.UnderstandingData = (function(){
	function UnderstandingData(level, ts) {
		this.level = level;
		this.timestamp = ts;
		
		UnderstandingData.prototype.getLevel = function(callback) {
			callback(null, this.level);
		};
		
		UnderstandingData.prototype.getTimestamp = function(callback) {
			callback(null, this.timestamp);
		};
		
	}
	return UnderstandingData;
})();