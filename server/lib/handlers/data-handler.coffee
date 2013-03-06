# data-handler.coffee

mongo = require 'mongojs'
async = require 'async'

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

        updateData: (bucketName, criteria, newValue, callback) =>
            @db[bucketName].update criteria, newValue, (updateError, updateResult) =>
                callback updateError, updateResult

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

        addUnderstandingLevel: (understandingDetails, understandingData, callback) =>
            saveUnderstandingDetails =
                saveLocal: (saveLocalPartialCallback) =>
                    @saveUnderstandingLevelLocal understandingDetails, understandingData, (saveLocalError, saveLocalResult) =>
                        saveLocalPartialCallback saveLocalError, saveLocalResult
                saveDB: (saveDBPartialCallback) =>
                    @saveUnderstandingLevelDB understandingDetails, (saveDBError, saveDBResult) =>
                        saveDBPartialCallback saveDBError, saveDBResult
            async.parallel saveUnderstandingDetails, (saveError, saveResult) =>
                if saveError?
                    callback saveError, null
                else
                    addResult =
                        result: "Success!"
                    lecturerUsername = @currentlyLecturing[understandingDetails.lectureCode]
                    if lecturerUsername?
                        # send the new average in socketmap
                        lecturerSocket = @socketMap[lecturerUsername]
                        recentUnderstandings = []
                        allUnderstandings = @understandingLevels[understandingDetails.lectureCode]
                        for currentDevice in allUnderstandings
                            deviceUnderstandings = allUnderstandings[currentDevice]
                            latestUnderstandingData = deviceUnderstandings[deviceUnderstandings.length - 1]
                            currentLevel = latestUnderstandingData.getLevel()
                            levelAsNumber = Number(currentLevel)
                            recentUnderstandings.push levelAsNumber
                    callback null, addResult
        
        saveUnderstandingLevelLocal: (understandingObj, understandingData, callback) =>
            lectureData = @understandingLevels[understandingObj.lectureCode]
            if not lectureData?
                wrongLectureCodeError = new Error "Lecture code #{understandingObj.lectureCode} unknown in understanding levels"
                callback wrongLectureCodeError, null
            else
                deviceData = lectureData[understandingObj.deviceId]
                if not deviceData?
                    wrongDeviceIdError = new Error "Device Id #{understandingObj.deviceId} unknown in understanding levels"
                    callback wrongDeviceIdError, null
                else
                    deviceData.push understandingData
                    lectureData[understandingObj.deviceId] = deviceData
                    @understandingLevels[understandingObj.lectureCode]
                    callback null, true

        saveUnderstandingLevelDB: (understandingObj, understandingData, callback) =>
            currentLectureCode = understandingObj.lectureCode
            currentDeviceId = understandingObj.deviceId
            currentCourseCode = undefined
            # look for the course code
            for courseCode, lectureCode of @usedLectureCodes
                if lectureCode is currentLectureCode
                    currentCourseCode = courseCode
                    break
            if not currentCourseCode?
                unknownCourseCodeError = new Error "Unknown course code"
                callback unknownCourseCodeError, null
            else
                courseCodeCriteria =
                    courseCode: currentCourseCode
                @findData "understandings", courseCodeCriteria, (findCourseCodeError, findCourseCodeResult) =>
                    if findCourseCodeError?
                        callback findCourseCodeError, null
                    else
                        if not findCourseCodeResult?
                            # should add a new one and save
                            brandNewUnderstanding =
                                deviceId: currentDeviceId
                                timestamp: understandingData.getTimestamp()
                                level: understandingData.getLevel()
                            brandNewSession =
                                lectureCode: currentLectureCode
                                understandings: [brandNewUnderstanding]
                            brandNewCourseCode =
                                courseCode: currentCourseCode
                                allLectures: [brandNewSession]
                            @saveData "understandings", brandNewCourseCode, (newDataError, newDataResult) =>
                                if not newDataError?
                                    callback newDataError, null
                                else
                                    if not newDataResult?
                                        saveUnderstandingError = new Error "Error saving new understanding to DB"
                                        callback saveUnderstandingError, null
                                    else
                                        callback null, true
                        else if findCourseCodeResult.length > 1
                            tooManyCourseCodeError = new Error "There are too many entries in the DB for course code #{currentCourseCode}"
                            callback tooManyCourseCodeError, null
                        else
                            currentEntry = findCourseCodeResult[0]
                            allLectures = currentEntry.allLectures
                            targetedSession = undefined
                            targetedSessionIndex = undefined
                            for curIndex, curLecture in allLectures
                                if curLecture.lectureCode is currentLectureCode
                                    targetedSession = curLecture
                                    targetedSessionIndex = curIndex
                                    break
                            if not targetedSession?
                                # should create a new session and save it in the db
                                myNewUnderstanding =
                                    deviceId: currentDeviceId
                                    timestamp: understandingData.getTimestamp()
                                    level: understandingData.getLevel()
                                myNewLectureData =
                                    lectureCode: currentLectureCode
                                    understandings: [myNewUnderstanding]
                                allLectures.push myNewLectureData
                                myNewCourseData =
                                    courseCode: currentCourseCode
                                    allLectures: allLectures
                                @updateData "understandings", myNewCourseData, {multi: false}, (updateError0) =>
                                    if updateError0?
                                        callback updateError0, null
                                    else
                                        callback null, true
                            else
                                curUnderstandings = targetedSession.understandings
                                newUndersandingData =
                                    deviceId: currentDeviceId
                                    timestamp: understandingData.getTimestamp()
                                    level: understandingData.getLevel()
                                curUnderstandings.push newUndersandingData
                                revisedSessionData =
                                    lectureCode: currentLectureCode
                                    understandings: curUnderstandings
                                allLectures[targetedSessionIndex] = revisedSessionData
                                revisedCourseCodeObj =
                                    courseCode: currentCourseCode
                                    allLectures: allLectures
                                @updateData "understandings", revisedCourseCodeObj, {multi: false}, (updateError) =>
                                    if updateError?
                                        callback updateError, null
                                    else
                                        callback null, true