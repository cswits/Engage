# lecture.coffee

async = require('async');
ValidatorFactory = require('../handlers/validator').ValidatorFactory;
DataHandlerFactory = require('../handlers/data-handler').DataHandlerFactory;

exports.Lecture = class Lecture
	constructor: () ->
		@validator = ValidatorFactory.getValidatorInstance()
		@dataHandler = DataHandlerFactory.getDataHandlerInstance()

	getNewLectureCode: (courseCode, lecturerUsername, callback) =>
        validateForLectureCode = 
            courseCode: (courseCodePartialCallback) =>
                @validateCourseCode courseCode, (courseCodeValidationError, validatedCourseCode) =>
                    if courseCodeValidationError?
                        courseCodePartialCallback courseCodeValidationError, null
                    else
                        courseCodePartialCallback null, validatedCourseCode
            lecturerUsername: (lecturerUsernamePartialCallback) =>
                @validateUsername lecturerUsername, (usernameValidationError, validatedUsername) =>
                    if usernameValidationError?
                        lecturerUsernamePartialCallback usernameValidationError, null
                    else
                        lecturerUsernamePartialCallback null, validatedUsername
        async.parallel validateForLectureCode, (validationError, validationResult) =>
            if validationError?
                callback validationError, null
            else
                @dataHandler.generateNewLectureCode validationResult, (lectureCodeError, lectureCodeResult) =>
                    if lectureCodeError?
                        callback lectureCodeError, null
                    else
                        callback null, lectureCodeResult

	joinLecture: (lectureCode, deviceId, callback) =>
        validateForJoinLecture = 
            deviceId: (deviceIDPartialCallback) =>
                @validateDeviceId deviceId, (deviceIDValidationError, validatedDeviceId) =>
                    if deviceIDValidationError?
                        deviceIDPartialCallback deviceIDValidationError, null
                    else
                        deviceIDPartialCallback null, validateDeviceId
            lectureCode: (lectureCodePartialCallback) =>
                @validateLectureCode lectureCode, (lectureCodeValidationError, validatedLectureCode) =>
                    if lectureCodeValidationError?
                        lectureCodePartialCallback lectureCodeValidationError, null
                    else
                        lectureCodePartialCallback null, validatedLectureCode
        async.parallel validateForJoinLecture, (validationError, validationResult) =>
            if validationError?
                callback validationError, null
            else
                callback null, validationResult


	endLecture: (lectureCode, callback) =>
        @validateLectureCode lectureCode, (lectureCodeValidationError, validatedLectureCode) =>
            if lectureCodeValidationError?
                callback lectureCodeValidationError, null
            else
                @dataHandler.endLecture validatedLectureCode, (endLectureError, endLectureResult) =>
                    if endLectureError?
                        callback endLectureError, null
                    else
                        callback null, endLectureResult


	leaveLecture: (lectureCode, deviceId, callback) =>
        validateForLeaveLecture = 
            lectureCode: (lectureCodePartialCallback) =>
                @validateLectureCode lectureCode, (lectureCodeValidationError, validatedLectureCode) =>
                    if lectureCodeValidationError?
                        lectureCodePartialCallback lectureCodeValidationError, null
                    else
                        lectureCodePartialCallback null, validatedLectureCode
            deviceId: (deviceIDPartialCallback) =>
                @validateDeviceId deviceId, (deviceIDValidationError, validatedDeviceId) =>
                    if deviceIDValidationError?
                        deviceIDPartialCallback deviceIDValidationError, null
                    else
                        deviceIDPartialCallback null, validatedDeviceId
        async.parallel validateForLeaveLecture, (validationError, validationResult) =>
            if validationError?
                callback validationError, null
            else
                @dataHandler.unmapLectureCodeFromStudent validationResult, (leaveError, leaveResult) =>
                    if leaveError?
                        callback leaveError, null
                    else
                        callback null, leaveResult

    submitUnderstandingLevel: (lectureCode, deviceId, understandingLevel, callback) =>
        validateForUnderstanding = 
            lectureCode: (lectureCodePartialCallback) =>
                @validateLectureCode lectureCode, (lectureCodeValidationError, validatedLectureCode) =>
                    if lectureCodeValidationError?
                        lectureCodePartialCallback lectureCodeValidationError, null
                    else
                        lectureCodePartialCallback null, validatedLectureCode
            deviceId: (deviceIDPartialCallback) =>
                @validateDeviceId deviceId, (deviceIDValidationError, validatedDeviceId) =>
                    if deviceIDValidationError?
                        deviceIDPartialCallback deviceIDValidationError, null
                    else
                        deviceIDPartialCallback null, validatedDeviceId
            understandingLevel: (understandingLevelPartialCallback) =>
                @validateForUnderstanding understandingLevel, (understandingLevelValidationError, validatedUnderstandingLevel) =>
                    if understandingLevelValidationError?
                        understandingLevelPartialCallback understandingLevelValidationError, null
                    else
                        understandingLevelPartialCallback null, validatedUnderstandingLevel
        async.parallel validateForUnderstanding, (validationError, validationResult) =>
            if validationError?
                callback validationError, null
            else
                now = new Date().toTimeString()
                understandingData = new UnderstandingData validationResult.understandingLevel, now
                @dataHandler.addUnderstandingLevel validationResult, understandingData, (understandingError, understandingResult) =>
                    if understandingError?
                        callback understandingError, null
                    else
                        callback null, understandingResult

	simpleValidation: (value, errorMessage, callback) =>
		@validator.validate value, errorMessage, (validationError, validationResult) =>
            if validationError?
                callback validationError, null
            else
                callback null, validationResult

    validateUsername: (username, callback) =>
        @simpleValidation username, "Username missing!", (usernameValidationError, validatedUsername) =>
            if usernameValidationError?
                callback usernameValidationError, null
            else
                callback null, validatedUsername

    validateCourseCode: (courseCode, callback) =>
        @simpleValidation courseCode, "Course code missing!", (courseCodeValidationError, validatedCourseCode) =>
            if courseCodeValidationError?
                callback courseCodeValidationError, null
            else
                callback null, validatedCourseCode

    validateDeviceId: (deviceId, callback) =>
        @simpleValidation deviceId, "Device Id missing!", (deviceIDValidationError, validatedDeviceId) =>
            if deviceIDValidationError?
                callback deviceIDValidationError, null
            else
                callback null, validatedDeviceId

    validateLectureCode: (lectureCode, callback) =>
        @simpleValidation lectureCode "Lecture code missing!", (lectureCodeValidationError, validatedLectureCode) =>
            if lectureCodeValidationError?
                callback lectureCodeValidationError, null
            else
                callback null, validatedLectureCode

    validateUnderstandingLevel: (understandingLevel, callback) =>
        @simpleValidation understandingLevel, "Understanding level missing!", (understandingLevelValidationError, validatedUnderstandingLevel) =>
            if understandingLevelValidationError?
                callback understandingLevelValidationError, null
            else
                callback null, validatedUnderstandingLevel