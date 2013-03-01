# lecture.coffee

async = require('async')
ValidatorFactory = require('../handlers/validator').ValidatorFactory
DataHandlerFactory = require('../handlers/data-handler').DataHandlerFactory

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
            if courseCodeValidationError?
                callback courseCodeValidationError, null
            else
                callback null, validatedCourseCode

    validateUsername: (username, callback) =>
        @simpleValidation username, "Username missing!", (usernameValidationError, validatedUsername) =>
            callback usernameValidationError, validatedUsername