
Validator = function() {};

Validator.prototype.validate = function(value, errorMessage, callback) {
	if ((!value) || (value.length == 0)) {
		var missingValueError = new Error(errorMessage);
		callback(missingValueError, null);
	} else callback(null, value);
};


if ((!value) || (value.length == 0)) {
	var missingValueError = new Error(errorMessage);
	callback(missingValueError, null);
} else callback (null, value)

exports.Validator = Validator;
