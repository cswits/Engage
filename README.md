# Engage

*Engage* is a Mobile app to gauge audience interest during a lecture. At the beginning of a lecture, a lecturer obtains a lecture code that he/she communicates to the audience (students). The latter can then use the code to join the lecture and from time to time inform of their level of understanding of the concepts being discussed.

# Architecture and Technology

*Engage* is a client/server application. The client can be a Web interface or a mobile application. Currently, we use the *PhoneGap* framework (including other Web stuff like jquery mobile) to implement the mobile app. As for the server, it is developed with node.js

#Installation

## Server Code

If you wanna host your own version of *Engage*, all you have to do is to clone the repository (from github) and copy the server code. If you have node.js installed on your machine you can then run it as follows:
<pre><code>
	node engage.js
</code></pre>

We use *MongoDb* as DBMS. So, you need to install mongodb on your machine. To start the mongodb server you can do the following:
<pre><code>
	mongod --dbpath [database path] --port cxxxxx --host dasdsad
</code></pre>

## Installing Node.js

Go to http://nodejs.org/ for more information about Node.js and its installation.

### Quick tip

If you are on Mac OS X and using homebrew as your package manager, the following command should do.

<pre><code>
        brew install --force -v node
</code></pre>

If you do not own /usr/local, you should use sudo. You can own /usr/local using the chown command
You should also install npm, the node.js package manager.