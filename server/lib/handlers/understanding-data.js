// understanding-data.js

exports.UnderstandingData = (function(){
	"use strict";

	function UnderstandingData(level, ts) {
		this.level = level;
		this.timestamp = ts;
	}

	UnderstandingData.prototype.getLevel = function() {
		return this.level;
	};

	UnderstandingData.prototype.getTimestamp = function() {
		return this.timestamp;
	};

	return UnderstandingData;
})();