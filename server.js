var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');


var app = express();
var server = http.Server(app);
var io = socketIO(server);

// Helper variables
var port = 8000;

app.set('port', port);
app.use('/', express.static(__dirname));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'))
})

server.listen(8000, () => console.log(`Starting server on port ${port}`));

var players = {};

// Handle player connection logic
io.on('connection', function(socket) {
    socket.on('new player', () => {
        console.log("New player has joined with Socket ID: " + socket.id);
        
        const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
        
        players[socket.id] = {
            name: randomName
        }
    })

    socket.on('drawing', (drawingData) => {
        console.log(`${socket.id} is drawing`);
        // Broadcast the drawing path to other clients
        socket.broadcast.emit('drawing', drawingData);
    });

    socket.on('disconnect', () => {
        console.log("Player disconnected with Socket ID: " + socket.id);
        delete players[socket.id];
        console.log(players);
    });
})