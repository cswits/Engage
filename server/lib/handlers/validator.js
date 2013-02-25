exports.Validator = (function() {
	this.validatorInstance = null;
	
	var getInstance = function() {
		if (!this.validatorInstance) {
			this.validatorInstance = createInstance();
		}
		
		return this.validatorInstance;
	};
	
	var createInstance = function() {
		return {
			validate: function(value, errorMessage, callback) {
				if ((!value) ||((typeof value == "string") && (value.length === 0))) {
					var missingValueError = new Error(errorMessage);
					callback(missingValueError, null);
				} else callback(null, value);
			}
		};
	};
})();