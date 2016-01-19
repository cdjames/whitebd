$( document ).ready(function() {
  var socket = io(),
            message,
            studentName = $.cookie('student');

  console.log(studentName);

  $('form').submit(function(e){
    e.preventDefault();
    message = $('#m').val();

    if(message.toLowerCase() == "clear()") { 
      $('#messages').html(''); 
      $('#m').val('');
    }
    else {
      socket.emit('student text', {'message': message, 'sender': studentName});
      $('#m').val('');
      // return false;
    }
  });

  socket.on('student text', function(data){
    if (data.sender == studentName) 
    {
        var $message = $("<li>"+ data.message 
                          + "<span><i> -- " + data.sender + "</i></span>" 
                        + "</li>");
        // $('#messages').append($('<li>').text(data.message));
        $('#messages').append($message);
        scrollBottom(); // scrolls to bottom of page
    }
    
  })
  .on('teacher text', function(data){

      // count++; // for input colors above

      var $message = $("<li style='background:red; color:white;'>"+ data.message 
                        + "<span><i> -- " + data.sender + "</i></span>" 
                      + "</li>");
      // $('#messages').append($('<li>').text(data.message));
      $('#messages').append($message);
      scrollBottom(); // scrolls to bottom of page
    
  });


  function scrollBottom() {
    window.scrollTo(0,document.body.scrollHeight);
  }

});