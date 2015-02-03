var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(cookieParser());
// app.use(express.urlencoded()); // to support URL-encoded bodies
// var domain = require('domain');
// var d = domain.create();
var fs = require('fs'); // needed to read files
var url = require('url');

/*app.get forwards urls to specified html page*/
app.get('/', function(req, res){
  // res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/index.html');
  // console.log(req);
})

  .get('/user', function(req, res){
    var parsedUrl = url.parse(req.url, true);
    console.log("Cookies: ", req.cookies);
    console.log(parsedUrl.query);
    // res.send('<h1>Hello world</h1>');
    if (parsedUrl.query.name == req.cookies.username 
        && req.cookies.login == 'success'){
      res.sendFile(__dirname + '/user.html');
    } else {
      res.cookie('login', 'null');
      res.redirect('/');
    }
    
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
    var name = req.body.username,
        user_file;

  // d.on('error', function(err) { // handles errors from readFile
  //   if (err.errno == 34){       // i.e. "no file found"
  //     console.error("file "+err.path+" does not exist");     
  //     res.send('no_user');          
  //   }
  // });

  // d.run(function() {
    // if (fs.exists)
    fs.readFile(name+'.json', 'utf8', function (err, data) {
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
          res.cookie('login', 'success').cookie('username', name);
          res.redirect('/user?name='+name);
          // res.send({code: 'success', 
          //           html: 'html'}
          //           );
          console.log("user " + name + " logged in.");
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