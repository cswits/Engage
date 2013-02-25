// engage_server.js

var express = require('express');

// set up the app server
var app = express();
app.set( "jsonp callback", true);

// define configuration for express
app.configure(function() {
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
});

var io = require('socket.io').listen(app);

// routes

require('./routes/lecturer-routes')(app, io);
require('./routes/lecture-routes')(app);

app.listen(7001);
console.log("Engage server listening on port 7001");