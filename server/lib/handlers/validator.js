exports.Validator = (function(){
	function Validator() {
		Validator.prototype.validate = function(value, errorMessage, callback) {
			if ((!value) || ((typeof value == "string") && (value.length == 0))) {
				var missingValueError = new Error(errorMessage);
				callback(errorMessage, null);
			} else callback(null, value);
		};
	}
	return Validator;
})();