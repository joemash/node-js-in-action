var http = require('http');
//buil in fs module provides
//filesystem related functionality
var fs = require('fs');
//built in path module provides
//filesystem path-related functionality
var path = require('path');
//Addon - mime module provides ability to derive
// a MIME type based on a filename extension.
var mime=require('mime-types');
// cache objects is where the contents
//of cached files are stored
var cache = {};

var chatServer = require('./lib/chat_server');

function send404(response) {
    //helper functions used for 
    //serving static HTTP files
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}


/** The second helper function serves file data. The function first writes the appropriate
HTTP headers and then sends the contents of the file. Add the following code to
server.js:*/
function sendFile(response, filePath, fileContents) {
    response.writeHead(
    200,
    {"content-type": mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}


function serveStatic(response, cache, absPath) {
/**The next helper determines whether or not a file is cached and,
if so, serves it. If a file isn’t cached, it’s read from disk and served. If the file doesn’t
exist, an HTTP 404 error is returned as a response. */
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists) {
            if (exists) {
                fs.readFile(absPath, function(err, data) {
                    if (err) {
                        send404(response);
                        } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
            send404(response);
        }
    });
}
}
/**
 For the HTTP server, an anonymous 
 function is provided as an argument to create-
Server , acting as a callback that defines how each
 HTTP request should be handled.
The callback function accepts two arguments: 
request and response . When the call-
back executes, the HTTP server will populate these 
arguments with objects that,
respectively, allow you to work out the details 
of the request and send back a response.
 *
 */
var server = http.createServer(function(request, response) {
    /*Create HTTP server, using anonymous function to
    define per-request behavior */
    var filePath = false;
    /**Determine HTML file to be served by default */
    if (request.url == '/') {
        filePath = 'public/index.html';
        /**Translate URL path to relative file path */
    } else {
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    //Serve static file
    serveStatic(response, cache, absPath);
});

//start the server, requesting that it listen on TCP / IP port 3000.
server.listen(3000, function() {
    console.log("Server listening on port 3000.");
});

chatServer.listen(server);