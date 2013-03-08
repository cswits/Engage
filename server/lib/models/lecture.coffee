# lecture.coffee

async = require 'async'
ValidatorFactory = require('../handlers/validator').ValidatorFactory
DataHandlerFactory = require('../handlers/data-handler').DataHandlerFactory
UnderstandingData = require('../handlers/understanding-data').UnderstandingData

exports.Lecture = class Lecture
    constructor: () ->
        @validator = ValidatorFactory.getValidatorInstance()
        @dataHandler = DataHandlerFactory.getDataHandlerInstance()

    submitUnderstandingLevel: (lectureCode, deviceId, understandingLevel, callback) =>
        validateForUnderstanding =
            lectureCode: (lectureCodePartialCallback) =>
                @validateLectureCode lectureCode, (lectureCodeValidationError, validatedLectureCode) =>
                    lectureCodePartialCallback lectureCodeValidationError, validatedLectureCode
            deviceId: (deviceIdPartialCallback) =>
                @validateDeviceId deviceId, (deviceIdValidationError, validatedDeviceId) =>
                    deviceIdPartialCallback deviceIdValidationError, validatedDeviceId
            understandingLevel: (understandingLevelPartialCallback) =>
                @validateUnderstandingLevel understandingLevel, (understandingLevelValidationError, validatedUnderstandingLevel) =>
                    understandingLevelPartialCallback understandingLevelValidationError, validatedUnderstandingLevel
        async.parallel validateForUnderstanding, (validationError, validationResult) =>
            if validationError?
                callback validationError, null
            else
                now = new Date().toTimeString()
                understandingData = new UnderstandingData validationResult.understandingLevel, now
                @dataHandler.addUnderstandingLevel validationResult, understandingData, (addUnderstandingLevelError, addUnderstandingLevelResult) =>
                    callback addUnderstandingLevelError, addUnderstandingLevelResult

    leaveLecture: (lectureCode, deviceId, callback) =>
        validateForLeaveLecture =
            lectureCode: (lectureCodePartialCallback) =>
                @validateLectureCode lectureCode, (lectureCodeValidationError, validatedLectureCode) =>
                    lectureCodePartialCallback lectureCodeValidationError, validatedLectureCode
            deviceId: (deviceIdPartialCallback) =>
                @validateDeviceId deviceId, (deviceIdValidationError, validatedDeviceId) =>
                    deviceIdPartialCallback deviceIdValidationError, validatedDeviceId
        async.parallel validateForLeaveLecture, (validationError, validationResult) =>
            if validationError?
                callback validationError, null
            else
                @dataHandler.unmapLectureCodeFromStudent validationResult, (unmapError, unmapResult) =>
                    callback unmapError, unmapResult

    endLecture: (lectureCode, callback) =>
        @validateLectureCode lectureCode, (lectureCodeValidationError, validatedLectureCode) =>
            if lectureCodeValidationError?
                callback lectureCodeValidationError, null
            else
                @dataHandler.endLecture validatedLectureCode, (endLectureError, endLectureResult) =>
                    callback endLectureError, endLectureResult

    joinLecture: (lectureCode, deviceId, callback) =>
        validateForLectureCode =
            lectureCode: (lectureCodePartialCallback) =>
                @validateLectureCode lectureCode, (lectureCodeValidationError, validatedLectureCode) =>
                    if lectureCodeValidationError?
                        lectureCodePartialCallback lectureCodeValidationError, null
                    else
                        lectureCodePartialCallback null, validatedLectureCode
            deviceId: (deviceIdPartialCallback) =>
                @validateDeviceId deviceId, (deviceIdValidationError, validatedDeviceId) =>
                    if deviceIdValidationError?
                        deviceIdPartialCallback deviceIdValidationError, null
                    else
                        deviceIdPartialCallback null, validatedDeviceId
        async.parallel validateForLectureCode, (validationError, validationResult) =>
            if validationError?
                callback validationError, null
            else
                @dataHandler.mapLectureCodeToStudent validationResult, (mappingError, mappingResult) =>
                    if mappingError?
                        callback mappingError, null
                    else
                        callback null, mappingResult                  

    getNewLectureCode: (courseCode, lecturerUsername, callback) =>
        validateForLectureCode =
            courseCode: (courseCodePartialCallback) =>
                @validateCourseCode courseCode, (courseCodeValidationError, validatedCourseCode) =>
                    if courseCodeValidationError?
                        courseCodePartialCallback courseCodeValidationError, null
                    else
                        courseCodePartialCallback null, validatedCourseCode
            username: (lecturerUsernamePartialCallback) =>
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

    simpleValidation: (value, errorMessage, callback) =>
        @validator.validate value, errorMessage, (validationError, validationResult) =>
            if validationError?
                callback validationError, null
            else
                callback null, validationResult

    validateCourseCode: (courseCode, callback) =>
        @simpleValidation courseCode, "Course code missing!", (courseCodeValidationError, validatedCourseCode) =>
            callback courseCodeValidationError, validatedCourseCode

    validateUnderstandingLevel: (understandingLevel, callback) =>
        @simpleValidation understandingLevel, "Understanding level missing!", (understandingLevelValidationError, validatedUnderstandingLevel) =>
            callback understandingLevelValidationError, validatedUnderstandingLevel

    validateUsername: (username, callback) =>
        @simpleValidation username, "Username missing!", (usernameValidationError, validatedUsername) =>
            callback usernameValidationError, validatedUsername

    validateLectureCode: (lectureCode, callback) =>
        @simpleValidation lectureCode, "Lecture code missing!", (lectureCodeValidationError, validatedLectureCode) =>
            callback lectureCodeValidationError, validatedLectureCode

    validateDeviceId: (deviceId, callback) =>
        @simpleValidation deviceId, "Device Id missing!", (deviceIdValidationError, validatedDeviceId) =>
            callback deviceIdValidationError, validatedDeviceId