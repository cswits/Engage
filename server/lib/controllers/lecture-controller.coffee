# lecture-controller.coffee

Lecture = require('../models/lecture').Lecture;
ResponseHandlerFactory = require('../handlers/response-handler').ResponseHandlerFactory;

exports.LectureController = class LectureController
	constructor: () ->
		@lecture = new Lecture
		@responseHandler = ResponseHandlerFactory.getResponseHandlerInstance()

	createLectureCode: (request, response) =>
		console.log "Generating a new lecture code for a course..."

		courseCode = request.query.courseCode
		lecturerUsername = request.query.username
		
		@lecture.getNewLectureCode courseCode, lecturerUsername, (newCourseCodeError, newCourseCodeResult) =>
			@responseHandler.handleResponse newCourseCodeError, newCourseCodeResult, request, response

	joinLecture: (request, response) =>
		console.log "Student joining a lecture..."

		lectureCode = request.query.lectureCode
		deviceId = request.query.deviceId

		@lecture.joinLecture lectureCode, deviceId, (joinLectureError, joinLectureResult) =>
			@responseHandler.handleResponse joinLectureError, joinLectureResult, request, response

	endLecture: (request, response) =>
		console.log "Lecturer ending a lecture..."

		lectureCode = request.query.lectureCode
		@lecture.endLecture lectureCode, (endLectureError, endLectureResult) =>
			@responseHandler.handleResponse endLectureError, endLectureResult, request, response

	leaveLecture: (request, response) =>
		console.log "Student leaving a lecture ..."

		lectureCode = request.query.lectureCode
		deviceId = request.query.deviceId

		@lecture.leaveLecture lectureCode, deviceId, (leaveLectureError, leaveLectureResult) =>
			@responseHandler.handleResponse leaveLectureError, leaveLectureResult, request, response

	submitUnderstandingLevel: (request, response) =>
		console.log "Student submitting their current level of understanding..."

		lectureCode = request.query.lectureCode
		deviceId = request.query.deviceId
		understandingLevel = request.query.understandingLevel

		@lecture.submitUnderstandingLevel lectureCode, deviceId, understandingLevel, (understandingError, understandingResult) =>
			@responseHandler.handleResponse understandingError, understandingResult, request, response