// requiring packages
var LectureController = requires('../lib/controllers/lecture-controller').LectureController;

module.exports = function(app) {	
	// lecturer creating a new lecture code
	app.get('/lecture/code/new', function(request, response) {
		new LectureController().createLectureCode(request, response);
	});
	
	// student joining a lecture
	app.get('/lecture/join', function(request, response) {
		new LectureController().joinLecture(request, response);
	});
	
	// lecturer ending a lecture
	app.get('/lecture/end', function(request, response){
		new LectureController().endLecture(request, response);
	});
}

app.get('/lecture/leave', function(request, response) {
	console.log("Student leaving lecture");
	
	var lectureCode = request.body["lectureCode"];
	var deviceId = request.body["deviceId"];
	
	lecture.leaveLecture(lectureCode, deviceId, function(leaveLectureError, leaveLectureResult) {
		if (leaveLectureError) this.respondWithError(leaveLectureError, response);
		else this.respondWithSuccess(leaveLectureResult, request, response);
	});
});

app.get('/understanding/add', function(request, response) {
	console.log("Student submitting current understanding level");
	
	var lectureCode = request.body["lectureCode"];
	var deviceId = request.body["deviceId"];
	var understanding_level = request.body["understanding"];
	
	lecture.submitUnderstandingLevel(lectureCode, deviceId, understanding_level, function(understandingError, understandingResult) {
		if (understandingError) this.respondWithError(understandingError, response);
		else this.respondWithSuccess(understandingResult, request, response);
	});
});

app.get('/understanding/refresh/:lectureCode', function(request, response) {
	console.log("Refreshing the average understanding graph...");
	
	var lectureCode = request.params["lectureCode"];
	
	lecture.refreshAverageUnderstandingLevel(lectureCode, function(error, result){
		if (error) this.respondWithError(error, response);
		else this.respondWithSuccess(result, request, response);
	});
	
});