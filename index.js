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
// var domain = require('domain');
// var d = domain.create();
var fs = require('fs'); // needed to read files

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
})
  .get('/logout', function(req, res){
    // res.send('<h1>Hello world</h1>');
    res.cookie('login', 'null');
    res.redirect('/');
})
  .get('/jquery.cookie.js', function(req, res){
    res.sendFile(__dirname + '/jquery.cookie.js');
  });
/* handle login here */
app.post('/post', function(req, res){
    var filename = req.body.username + '.json';
    var user_file;

  // d.on('error', function(err) { // handles errors from readFile
  //   if (err.errno == 34){       // i.e. "no file found"
  //     console.error("file "+err.path+" does not exist");     
  //     res.send('no_user');          
  //   }
  // });

  // d.run(function() {
    // if (fs.exists)
    fs.readFile(filename, 'utf8', function (err, data) {
      // console.log(err);
      if (err) { // can't open file
        // res.send('no_user');
        res.cookie('login', 'no_user');
        res.redirect('/');
        return console.error(err);
      }

      user_file = JSON.parse(data); // get contents of file

      if (user_file) { // user exists
        if (user_file.password == req.body.password) { // good password
          // res.sendFile(__dirname + '/user.html');
          res.cookie('login', 'success');
          res.redirect('/user');
          // res.send({code: 'success', 
          //           html: 'html'}
          //           );
          console.log("user " + req.body.username + " logged in.");
        } else { // wrong password
          // res.send('failure');
          res.cookie('login', 'bad_password');
          res.redirect('/');
        }
      } else {
        res.cookie('login', 'no_user');
        console.log("no such user.");
        // res.send('no_user');
        res.redirect('/');
      }
    });
  // });
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