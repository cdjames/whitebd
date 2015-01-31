var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/*app.get forwards urls to specified html page*/
app.get('/', function(req, res){
  // res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/index.html');
  console.log(req);
})

  .get('/user', function(req, res){
  // res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/user.html');
})

  .get('/master', function(req, res){
  // res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/master.html');
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