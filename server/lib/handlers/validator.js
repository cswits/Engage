// validator.js

exports.Validator = (function() {
	"use strict";
	var validatorInstance = null;
	
	var getInstance = function() {
		if (!validatorInstance) {
			validatorInstance = createInstance();
		}
		
		return validatorInstance;
	};
	
	var createInstance = function() {
		return {
			validate: function(value, errorMessage, callback) {
				if ((!value) ||((typeof value === "string") && (value.length === 0))) {
					var missingValueError = new Error(errorMessage);
					callback(missingValueError, null);
				} else {
					callback(null, value);
				}
			}
		};
	};
})();