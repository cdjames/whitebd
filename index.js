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
    // console.log("Cookies: ", req.cookies); // testing
    // console.log(parsedUrl.query); // testing
    
    if (parsedUrl.query.name == req.cookies.username // there is a param name and it matches the cookie
        && req.cookies.login == 'success'){ // and the login was successful
      // if (req.cookies.teachers != "true") {
        res.sendFile(__dirname + '/user.html'); // send the user to the page
      // } else {
      //   res.sendFile(__dirname + '/teacher.html'); // send the user to the page
      // }
      
    } else { // otherwise
      res.cookie('login', 'null'); // set the login cookie
      res.redirect('/'); // make them log in
    }
})
  .get('/teacher', function(req, res){ // request for example.com/user
    var parsedUrl = url.parse(req.url, true); // parse url param (example.com/user?param=value)
    // console.log("Cookies: ", req.cookies); // testing
    // console.log(parsedUrl.query); // testing
    
    if (parsedUrl.query.name == req.cookies.username // there is a param name and it matches the cookie
        && req.cookies.login == 'success'){ // and the login was successful
      res.sendFile(__dirname + '/teacher.html'); // send the user to the page
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
    res.cookie('login', 'null')
        .cookie('teachers', 'null');
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
    console.log("teachers are ",user_file.teachers.toString());
    // console.log("user_file.teachers is ",typeof user_file.teachers);
    if (user_file) { // user exists
      if (user_file.password == req.body.password) { // good password
        // cookie expires in 1 day
        res.cookie('login', 'success', { maxAge: 86400000 })
            .cookie('username', name, { maxAge: 86400000 })
            .cookie('teachers', user_file.teachers.toString(),{ maxAge: 86400000 });
        console.log("user " + name + " logged in.");
        if (user_file.teachers != true){ // if not a teacher
          res.redirect('/user?name='+name); // need to specify name in url param to reach page
        } else { // if a teacher
          console.log("games are ",user_file.game_names.toString());
          res.cookie('games', user_file.game_names.toString(),{ maxAge: 86400000 });
          res.redirect('/teacher?name='+name); // need to specify name in url param to reach page
        }
        
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
  .on('reset', function(teacher){
    io.emit('reset'+teacher);
  })
  .on('student in', function(data){
    console.log(data.teacher + " from line 126");
    io.emit('student in-'+data.teacher, data.username); // emit a message with the name of "teacher"
  })
  .on('student out', function(data){
    console.log(data.username + " from line 130");
    var teacher = 'student out-'+data.teacher;
    console.log('teacher variable is '+teacher);
    io.emit(teacher, data.username); // emit a message with the name of "student"
  })
  .on('answer out', function(data){
    console.log(data.answer + " from line 138");
    // var teacher = 'answer out-'+data.teacher;
    // console.log('teacher variable is '+teacher);
    io.emit('answer out-'+data.teacher, {"answer":data.answer,"username":data.username}); // emit a message with the name of "student"
  })
  .on('game on', function(data){ // sent from teacher
    console.log(data.teacher + " from line 138");
    console.log(data.game + " from line 139");
    var game = data.game,
        teacher = data.teacher,
        game_on = 'game_on_'+teacher;
    console.log('game_on = '+game_on);
    fs.readFile('games.json', 'utf8', function (err, file_data) {
      // console.log(JSON.parse(data));
      if (err) { // can't open file
        io.emit('game error-'+teacher);
        return console.error(err); // get out of the readFile
      }
      // if successful
      var game_data = JSON.parse(file_data),
          the_game = game_data[game],
          num_items = Object.keys(the_game),
          the_html=
            "<div id='"+game+"'>"; // get contents of file
      // console.log(the_game[num_items[1]]); 
      for (var i = 0, the_item; i < num_items.length; i++) {
        the_item = the_game[num_items[i]];
        // console.log(the_item);
        the_html += "<div id='"+num_items[i]+"' style='display: none'>"
                  +   "<div class='question'><ul><li>"+the_item.question+"</li></ul></div>"
                  +   "<div class='choices'><ol>";
        for (var x = 0; x < the_item.choices.length; x++) {
          the_html += "<li><button>"+the_item.choices[x]+"</button></li>";
        }
        the_html += "</ol></div>"
                  + "<div class='answer' style='display: none' data-src='"+the_item.answer+"'><ul><li><button>The Answer</button></li></ul></div>"
                  + "</div>";
      }
      // console.log(the_html);
      the_html += "<div id='num_items' style='display: none' data-src='"+num_items.length+"'></div></div>";
      io.emit(game_on, {"html":the_html, "items":num_items}); // send the game to users of sending teacher
    });
  });
});

/*start webserver on port 3000*/
http.listen(3000, function(){
  console.log('listening on *:3000');
});