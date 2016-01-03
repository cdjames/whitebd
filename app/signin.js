// $.urlParam = function(name){
//     var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
//     if (results==null){
//        return null;
//     }
//     else{
//        return results[1] || 0;
//     }
// }
$( document ).ready(function() {
  var login_cookie = $.cookie('login'),
      user_cookie = $.cookie('student'),
      teacher_cookie = $.cookie('teachers'),
      err_div = $('#err_message');
  console.log("login = "+login_cookie);
  console.log("student = "+user_cookie);
  console.log("teachers = "+teacher_cookie);
 
  switch(login_cookie) {
    case 'success':
      // alert('welcome');
      // if (teacher_cookie != "true") {
      //   window.location.replace("/student?name="+user_cookie);
      // } else {
      //   window.location.replace("/teacher?name="+user_cookie);
      // }
      break;
    case 'bad_password':
      console.log('wrong password');
      err_div.text('wrong password').fadeOut(6000);
      break;
    case 'bad_name':
      console.log('wrong name');
      err_div.text('choose a different user name').fadeOut(6000);
      break;
    case 'no_user':
      console.log('no such user');
      err_div.text('no such user').fadeOut(6000);
      break;
    case 'teacher_not_logged':
      console.log('teacher_not_logged');
      err_div.text('your teacher is not logged in').fadeOut(6000);
      break;
    default:
      console.log('please sign in');
      err_div.text('please sign in').fadeOut(6000);
  }

  if (user_cookie != null){
    $('#student').val(user_cookie);
    // $('#password').focus();
  } else {
    $('#username').focus();
  }
});
  // $('#user').submit(function(e){  
  //   e.preventDefault();
  //   e.stopImmediatePropagation();
  //   var user;
  //   $.post('/post', $(this).serialize(), function(data) {
  //     console.log(data);
  //       switch(data.code) {
  //         case 'success':
  //             // alert('welcome');
  //             $('body').html($(data.html).find('body').html());
  //             break;
  //         case 'failure':
  //             alert('bad password. try again.');
  //             break;
  //         case 'no_user':
  //             alert('no such user. try again.');
  //             break;
  //         default:
  //             console.log('something else went wrong');
  //       } 
  //   });
  // });