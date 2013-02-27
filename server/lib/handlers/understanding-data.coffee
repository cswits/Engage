# understanding-data.coffee

exports.UnderstandingData = class UnderstandingData
	constructor: (@level, @timestamp) ->

	getLevel: () =>
		@level

	getTimestamp: () =>
		@timestamp