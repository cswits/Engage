// lecturer-controller.js

var Lecturer = require('../models/lecturer').Lecturer;
var ResponseHandler = require('../handlers/response-handler').ResponseHandler;

exports.LecturerController = (function(){
	"use strict";

	function LecturerController(io) {
		this.lecturer = new Lecturer(27017, "localhost", io);
		this.responseHandler = ResponseHandler.getInstance();
	}

	LecturerController.prototype.authenticateLecturer = function(request, response) {
		console.log("Lecturer logging into the system...");
			
		var lecturerUsername = request.body.username;
		var lecturerPassword = request.body.password;

		this.lecturer.authenticate(lecturerUsername, lecturerPassword, function(authenticationError, authenticationResult) {
			this.responseHandler.handleResponse(authenticationError, authenticationResult, request, response);
		});
	};

	LecturerController.prototype.createLecturer = function(request, response) {
		console.log("Creating a new lecturer into the system...");
			
		var username = request.body.username;
		var password = request.body.password;
		var lastname = request.body.lastname;
		var firstname = request.body.firstname;
		var title = request.body.title;
			
		this.lecturer.create(username, password, lastname, firstname, title, function(createError, createResult) {
			this.responseHandler.handleResponse(createError, createResult, request, response);
		});
	};

	LecturerController.prototype.deleteLecturer = function(request, response) {
		console.log("Deleting an existing lecturer from the system...");
			
		var username = request.params.username;

		this.lecturer.deleteLecturer(username, function(deleteError, deleteResult){
			this.responseHandler.handleResponse(deleteError, deleteResult, request, response);
		});
	};

	return LecturerController;
})();