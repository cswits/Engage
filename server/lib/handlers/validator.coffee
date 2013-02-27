# validator.coffee

exports.ValidatorFactory = class ValidatorFactory
	_validatorInstance = undefined

	@getValidatorInstance: () =>
		_validatorInstance ?= new Validator

	class Validator
		constructor: () ->

		validate: (value, errorMessage, callback) =>
			if ((not value?) || ((typeof value is "string") && (value.length is 0)))
				missingValueError = new Error errorMessage
				callback missingValueError, null
			else
				callback null, value