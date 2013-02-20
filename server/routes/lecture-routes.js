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
	
	// refreshing average understanding level for lecturer
	// this might simply be handled with websocket or socket.io
	app.get('/lecture/understanding/refresh/:lectureCode', function(request, response) {
		console.log("To be determined");
	});
}