# engage.js

# set up app server
express = require 'express'
app = express()
app.set "jsonp callback", true

# define configuration for express

app.set "jsonp callback", true
app.configure =>
	app.use express.bodyParser()
	app.use express.methodOverride()
	app.use app.router

# attach io
io = require('socket.io').listen(app);

# adding routes
require('./routes/lecturer-routes')(app, io)
require('./routes/lecture-routes')(app)

app.listen 7001;
console.log "Engage server listening on port 7001"