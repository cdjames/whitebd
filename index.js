var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser')
// app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
// app.use(express.urlencoded()); // to support URL-encoded bodies
var fs = require('fs');
var obj;

/*app.get forwards urls to specified html page*/
app.get('/', function(req, res){
  // res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/index.html');
  // console.log(req);
})

  .get('/user', function(req, res){
    // res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname + '/user.html');
})

  .get('/master', function(req, res){
    // res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname + '/master.html');
});
app.post('/post', function(req, res){
    res.send('<h1>Hello world</h1>' + req.body);
    console.log("the request is...", req.body);
});

io.on('connection', function(socket){
  console.log('a user connected');

  /*messages between clients are controlled here*/
  socket.on('disconnect', function(){
    console.log('user disconnected');
  })
        .on('chat message', function(msg){
    io.emit('chat message', msg);
  })
        .on('reset', function(){
    io.emit('reset');
  });
});

/*start webserver on port 3000*/
http.listen(3000, function(){
  console.log('listening on *:3000');
});