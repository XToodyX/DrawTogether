var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
var server = http.Server(app);

// Helper variables
var port = 8000;

app.set('port', port);
app.use('/', express.static(__dirname));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'))
})

server.listen(8000, '0.0.0.0', () => console.log(`Starting server on port ${port}`));