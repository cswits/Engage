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
	
	// student leaving a lecture
	app.get('/lecture/leave', function(request, response) {
		new LectureController().leaveLecture(request, response);
	});
	
	// student submitting their current level of understanding
	app.get('/lecture/understanding/add', function(request, response){
		new LectureController().submitUnderstandingLevel(request, response);
	});
}

app.get('/understanding/refresh/:lectureCode', function(request, response) {
	console.log("Refreshing the average understanding graph...");
	
	var lectureCode = request.params["lectureCode"];
	
	lecture.refreshAverageUnderstandingLevel(lectureCode, function(error, result){
		if (error) this.respondWithError(error, response);
		else this.respondWithSuccess(result, request, response);
	});
	
});