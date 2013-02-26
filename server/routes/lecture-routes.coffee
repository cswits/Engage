# requiring packages
LectureController = require('../lib/controllers/lecture-controller').LectureController;

module.exports = (app) =>
        app.get '/lecture/code/new', (request, response) =>
                new LectureController().createLectureCode request, response

        app.get '/lecture/join', (request, response) =>
                new LectureController().joinLecture request, response

        app.get '/lecture/end', (request, response) =>
                new LectureController().endLecture request, response

        app.get '/lecture/leave', (request, response) =>
                new LectureController().leaveLecture request, response

        app.get '/lecture/understanding/add', (request, response) =>
                new LectureController().submitUnderstandingLevel request, response