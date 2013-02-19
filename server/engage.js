// engage_server.js

var express = require('express');
var Lecturer = require('./lecturer').Lecturer;
var Lecture = require('./lecture').Lecture;

// set up the app server
var app = express();
app.set( "jsonp callback", true);

var lecture = new Lecture(27017, "localhost");

// define configuration for express
app.configure(function() {
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
});

// routes

require('./routes/lecturer-routes')(app);
require('./routes/lecture-routes')(app);

app.listen(7001);
console.log("Engage server listening on port 7001");