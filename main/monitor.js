"use strict"
var express  = require('express'),
    app = express(),
    http = require('http').createServer(app),
    io   = require('socket.io')(http),
    zmq  = require('zmq'),
    sub  = zmq.socket('sub');

const confs = require('./configs/config');

const confZMQ = function(subscriber){
    var srvURI = 'tcp://' + confs.zmq.serverAddr + ':' + confs.zmq.port;
    subscriber.connect(srvURI);
    subscriber.subscribe(confs.zmq.queueId);
    console.log('> subscriber connected to ' + srvURI );
};

confZMQ(sub);

// -- express ----------------------------------------------------------------

app.use('/static', express.static(__dirname + '/'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/monitor.html');
});

// -- socket.io --------------------------------------------------------------

io.on('connection', function(socket){
    sub.on('message', function(topic, data){
        socket.emit('event', { 'content': JSON.parse(data) });
    });
});

http.listen(confs.port, function(){
    console.log('> webserver listening on *:'+confs.port);
});