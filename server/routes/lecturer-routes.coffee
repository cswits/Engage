# requiring packages
LecturerController = require('../lib/controllers/lecturer-controller').LecturerController;

module.exports = (app, io) =>
        app.get '/lecturers/login', (request, response) =>
                new LecturerController(io).authenticateLecturer request, response

        app.get '/lecturers/create', (request, response) =>
                new LecturerController(null).createLecturer request, response

        app.get '/lectures/delete/username', (request, response) =>
                new LecturerController(null).deleteLecturer request, response