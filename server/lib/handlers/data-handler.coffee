# data-handler.coffee

mongo = require 'mongojs'

exports.DataHandlerFactory = class DataHandlerFactory
	_dataHandlerInstance = undefined
	@getDataHandlerInstance: (port, host) =>
		_dataHandlerInstance ?= new DataHandler port, host

	class DataHandler
        constructor: (@port, @host) ->
            @db = mongo.connect "localhost/engageDB", ["lecturers", "understandings"]
            @usedLectureCodes = {}
            @currentLectureCodes = []
            @currentDeviceIds = {}
            @understandingLevels = {}
            @socketMap = {}
            @currentlyLecturing = {}

        findLecturers: (lecturerUsername, callback) =>
            criteria =
                username: lecturerUsername
            @findData "lecturers", criteria, (findError, findResult) =>
                callback findError, findResult

        findData: (bucketName, criteria, callback) =>
            @db[bucketName].find criteria, (findError, findResult) =>
                callback findError, findResult

        addLecturer: (lecturerData, callback) =>
            @saveData "lecturers", lecturerData, (addError, addResult) =>
                callback addError, addResult

        saveData: (bucketName, data, callback) =>
            @db[bucketName].save data, (saveError, saveResult) =>
                callback saveError, saveResult

        addSocket: (username, io, callback) =>
            if io?
                io.sockets.on 'connection', (socket) =>
                    @socketMap[username] = socket
            callback null, true

        deleteLecturer: (lecturerUsername, callback) =>
            criteria =
                username: lecturerUsername
            @deleteData "lecturers", criteria, (deleteError, deleteResult) =>
                callback deleteError, deleteResult

        deleteData: (bucketName, criteria, callback) =>
            @db[bucketName].remove criteria, (deleteError, deleteResult) =>
                callback deleteError, deleteResult

        generateNewLectureCode: (lectureCodeDetails, callback) =>
            courseCode = lectureCodeDetails.courseCode
            username = lectureCodeDetails.username
            lectureCode = ""
            while lectureCode.length < 8
                lectureCode = Math.random().toString(36).substr(2)
                lectureCode = lectureCode.substr(0, 8)
                existingUsedLectureCodes = @usedLectureCodes[courseCode]
                if not existingUsedLectureCodes?
                    @usedLectureCodes[courseCode] = [lectureCode]
                    break
                else if existingUsedLectureCodes.indexOf(lectureCode) is -1
                    existingUsedLectureCodes.push lectureCode
                    @usedLectureCodes[courseCode] = existingUsedLectureCodes
                    break
                else
                    lectureCode = ""
            @currentlyLecturing[lectureCode] = username
            @currentLectureCodes.push lectureCode
            lectureCodeResult =
                lectureCode: lectureCode
            callback null, lectureCodeResult
        
        mapLectureCodeToStudent: (mappingDetails, callback) =>
            if @currentLectureCodes.indexOf(mappingDetails.lectureCode) is -1
                wrongLectureCodeError = new Error "Lecture code does not exist"
                callback wrongLectureCodeError, null
            else
                myCurrentDevices = @currentDeviceIds[mappingDetails.lectureCode]
                if not myCurrentDevices?
                    myCurrentDevices = [mappingDetails.deviceId]
                else
                    # should check if the device belongs already
                    if myCurrentDevices.indexOf(mappingDetails.deviceId) is -1
                        myCurrentDevices.push mappingDetails.deviceId
                @currentDeviceIds[mappingDetails.lectureCode] = myCurrentDevices
                currentTS = new Date().toTimeString()
                result =
                    lectureCode: mappingDetails.lectureCode
                    time: currentTS
                callback null, result

        endLecture: (lectureCode, callback) =>
            lectureCodeIndex = @currentLectureCodes.indexOf lectureCode
            if lectureCodeIndex is -1
                wrongLectureCodeError = new Error "Lecture code does not exist"
                callback wrongLectureCodeError, null
            else
                @currentLectureCodes.splice lectureCodeIndex, 1
                delete @currentDeviceIds[lectureCode]
                delete @currentlyLecturing[lectureCode]
                endLectureResult =
                    result: "Success!"
                callback null, endLectureResult

        unmapLectureCodeFromStudent: (unmapDetails, callback) =>
            allLectureDevices = @currentDeviceIds[unmapDetails.lectureCode]
            if not allLectureDevices?
                unknownLectureCodeError = new Error "Lecture code unknown!"
                callback unknownLectureCodeError, null
            else
                deviceIndex = allLectureDevices.indexOf unmapDetails.deviceId
                if deviceIndex is -1
                    unknownDeviceError = new Error "Device unknown!"
                    callback unknownDeviceError, null
                else
                    allLectureDevices.splice deviceIndex, 1
                    if allLectureDevices.length is 0
                        delete @currentDeviceIds[unmapDetails.lectureCode]
                    leaveResult =
                        result: "Success!"
                    callback null, leaveResult

        addUnderstandingLevel: (lectureCode, deviceId, understandingData, callback) =>
            lectureData = @understandingLevels[lectureCode]
            if not lectureData?
                wrongLectureCodeError = new Error "Lecture code #{lectureCode} unknown for understanding levels"
                callback wrongLectureCodeError, null
            else
                deviceData = lectureData[deviceId]
                if not deviceData?
                    wrongDeviceIDError = new Error "Device ID #{deviceId} unknown for understanding levels"
                    callback wrongDeviceIDError, null
                else
                    deviceData.push understandingData
                    understandingRecord = 
                        lectureCode: lectureCode
                        deviceId: deviceId
                        timestamp: understandingData.getTimestamp()
                        undertandingLevel: understandingData.getLevel()
                    @saveData "understandings", understandingRecord, (error, result) =>
                        if error?
                            callback error, null
                        else
                            if not result?
                                saveFailedError = new Error "Saving understanding level to database failed!"
                                callback saveFailedError, null
                            else
                                addResult = 
                                    result: "Success!"
                                lecturerUsername = @currentlyLecturing[lectureCode]
                                if lecturerUsername?
                                    lecturerSocket = @socketMap[lecturerUsername]
                                    recentUnderstandings = []
                                    allUnderstandings = @understandingLevels[lectureCode]
                                    for currentDevice in allUnderstandings
                                        deviceUnderstandings = allUnderstandings[currentDevice]
                                        latestUnderstandingData = deviceUnderstandings[deviceUnderstandings.length - 1]
                                        currentLevel = latestUnderstandingData.getLevel()
                                        levelAsNumber = Number(currentLevel)
                                        recentUnderstandings.push levelAsNumber
                                    averageData = 
                                        averages: recentUnderstandings
                                    lecturerSocket.emit "averages", averageData
                                callback null, addResult