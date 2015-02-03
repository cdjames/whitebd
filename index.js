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

  .get('/user', function(req, res){ // request for example.com/user
    var parsedUrl = url.parse(req.url, true); // parse url param (example.com/user?param=value)
    console.log("Cookies: ", req.cookies); // testing
    console.log(parsedUrl.query); // testing
    
    if (parsedUrl.query.name == req.cookies.username // there is a param name and it matches the cookie
        && req.cookies.login == 'success'){ // and the login was successful
      res.sendFile(__dirname + '/user.html'); // send the user to the page
    } else { // otherwise
      res.cookie('login', 'null'); // set the login cookie
      res.redirect('/'); // make them log in
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

/* handle login attempts here */
app.post('/post', function(req, res){
  var name = req.body.username,
      user_file;
  
  fs.readFile(name+'.json', 'utf8', function (err, data) {
    // console.log(err);
    if (err) { // can't open file
      // res.send('no_user');
      res.cookie('login', 'no_user', { maxAge: 300000 });
      res.redirect('/'); // back to index
      return console.error(err); // get out of the readFile
    }
    // if successful
    user_file = JSON.parse(data); // get contents of file

    if (user_file) { // user exists
      if (user_file.password == req.body.password) { // good password
        // cookie expires in 1 day
        res.cookie('login', 'success', { maxAge: 86400000 }).cookie('username', name, { maxAge: 86400000 });
        res.redirect('/user?name='+name); // need to specify name in url param to reach page
        console.log("user " + name + " logged in.");
      } else { // wrong password
        res.cookie('login', 'bad_password', { maxAge: 300000 }); // cookie expires in 5 min
        res.redirect('/');
      }
    } else {
      res.cookie('login', 'no_user', { maxAge: 300000 });
      console.log("no such user.");
      // res.send('no_user');
      res.redirect('/');
    }
  });
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