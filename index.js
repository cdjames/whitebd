/* setup the app */
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



app.get('/', function(req, res){
  // res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/index.html');
})
  .get('/student', function(req, res){ // request for example.com/user
    checkLogin(req, res);
    // var parsedUrl = url.parse(req.url, true); // parse url param (example.com/user?param=value)
    // // console.log("Cookies: ", req.cookies); // testing
    // // console.log(parsedUrl.query); // testing
    
    // if (parsedUrl.query.name == req.cookies.username // there is a param name and it matches the cookie
    //     && req.cookies.login == 'success'){ // and the login was successful
      // if (req.cookies.teachers != "true") {
        // res.sendFile(__dirname + '/student.html'); // send the user to the page
      // } else {
      //   res.sendFile(__dirname + '/teacher.html'); // send the user to the page
      // }
      
    // } else { // otherwise
    //   res.cookie('login', 'null'); // set the login cookie
    //   res.redirect('/'); // make them log in
    })
  .get('/teacher', function(req, res){ // request for example.com/user
      // if(checkLogin(req, res)) {
      //   res.sendFile(__dirname + '/teacher.html'); // send the user to the page
      // } else {

      // }
      checkLogin(req, res);
    // var parsedUrl = url.parse(req.url, true); // parse url param (example.com/user?param=value)
    // // console.log("Cookies: ", req.cookies); // testing
    // // console.log(parsedUrl.query); // testing
    
    // if (parsedUrl.query.name == req.cookies.username // there is a param name and it matches the cookie
    //     && req.cookies.login == 'success'){ // and the login was successful
      // if (req.cookies.teachers != "true") {
        
      // } else {
      //   res.sendFile(__dirname + '/teacher.html'); // send the user to the page
      // }
      
    // } else { // otherwise
    //   res.cookie('login', 'null'); // set the login cookie
    //   res.redirect('/'); // make them log in
    })
  .get('/jquery.cookie.js', function(req, res){
      res.sendFile(__dirname + '/jquery.cookie.js')
    })
  .get('/socket.io-1.2.0.js', function(req, res){
      res.sendFile(__dirname + '/socket.io-1.2.0.js')
    })
  .get('/jquery-1.8.3.min.js', function(req, res){
      res.sendFile(__dirname + '/jquery-1.8.3.min.js')
    })
  .get('/signin.js', function(req, res){
      res.sendFile(__dirname + '/signin.js')
    })
  .get('/teacher.js', function(req, res){
      res.sendFile(__dirname + '/teacher.js')
    })
  .get('/student.js', function(req, res){
      res.sendFile(__dirname + '/student.js')
});

/* handle login attempts here */
app.post('/post', function(req, res){
  var teacher = req.body.username,
      student = req.body.student,
      user_file;
  if(teacher){
    fs.readFile(teacher+'.json', 'utf8', function (err, data) {
      // console.log(err);
      if (err) { // can't open file
        // res.send('no_user');
        bad_login(res, 'no_user');
        return console.error(err); // get out of the readFile
      }
      // if successful
      user_file = JSON.parse(data); // get contents of file
      console.log("teacher is ",user_file.username.toString());
      // console.log("user_file.teachers is ",typeof user_file.teachers);
      if (user_file) { // user exists
        if (user_file.password == req.body.password && teacher != student) { // good password & not same name as teacher
          // cookie expires in 1 day
          res.cookie('login', 'success', { maxAge: 86400000 })
              .cookie('teacher', teacher, { maxAge: 86400000 })
              .cookie('student', student, { maxAge: 86400000 });
          console.log("user " + student + " logged in.");
          if (student != user_file.teacherPass){ // if not a teacher
            res.clearCookie('isTeacher');
            res.redirect('/student?name='+student); // need to specify name in url param to reach page
          } else { // if a teacher
            res.cookie('isTeacher', 'true', { maxAge: 86400000 });
            // console.log("games are ",user_file.game_names.toString());
            // res.cookie('games', user_file.game_names.toString(),{ maxAge: 86400000 });
            res.redirect('/teacher?name='+teacher); // need to specify name in url param to reach page
          }
          
        } else { // wrong password or bad name
          if(teacher == student){bad_login(res, 'bad_name');}
          else {bad_login(res, 'bad_password');}
        }
      } else {
        bad_login(res, 'no_user');
      }
    });
  } else {
    bad_login(res, 'other_error');
  }
  
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  })
  .on('student text', function(data){
    io.emit('student text', data);
  })
  .on('teacher text', function(data){
    io.emit('teacher text', data);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function bad_login (res, msg) {
  res.cookie('login', msg, { maxAge: 300000 });
  console.log(msg);
  res.redirect('/');
}

function checkLogin(req, res) {
    var parsedUrl = url.parse(req.url, true); // parse url param (example.com/user?param=value)
    // console.log("Line 141 Cookies: ", req.cookies); // testing
    // console.log(parsedUrl.query); // testing
    
    if ((parsedUrl.query.name == req.cookies.student // there is a param name and it matches the cookie
        || parsedUrl.query.name == req.cookies.teacher)
        && req.cookies.login == 'success'){ // and the login was successful
      // console.log("line 148 passed first if");
      if (req.cookies.isTeacher == "true") {
        // console.log("line 150 passed 2nd if");
        res.sendFile(__dirname + '/teacher.html'); // send the user to the page
        return;
      } else {
        res.sendFile(__dirname + '/student.html'); // send the user to the page
      }   
    } else { // otherwise
      res.cookie('login', 'null'); // set the login cookie
      res.redirect('/'); // make them log in
    }
}