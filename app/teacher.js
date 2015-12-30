$( document ).ready(function() {
  var socket = io(),
            message,
            count = 0,
            ffamily = $('body').css('font-family'),
            fsize = $('#messages').css('font-size').slice(0, -2),
            SScolors = {},
            possColors = ["blue", "pink", "red", "orange", "yellow"],
            usedColors = [];

  $('form').submit(function(e){
    e.preventDefault();
    message = $('#m').val();

    if(message.toLowerCase() == "clear()") { 
      $('#messages').html(''); 
      $('#m').val('');
    }
    else {
      socket.emit('teacher text', {'message': message, 'sender': "teacher"});
      $('#m').val(''); // clear main input
      // return false; // get out of the function without actually doing any submission -- not needed because of preventDefault()
    }
  });

  /* handle teacher changes to student responses -- mostly change width of input fields*/
  $('#messages').on('click', 'input.m', function() {
    $(this).css('width', '90%'); // widen input to allow changes
  })
  .on('focusout', 'input.m', function() {
    var width = getWidthOfText($(this).val(), ffamily, fsize);
    $(this).css('width', width + 'px');
  });

  socket.on('student text', function(data){
      var bckgrnd, width;
      // console.log(SScolors[data.sender]);
      // if(SScolors[data.sender] === undefined){
      if(!SScolors[data.sender]){
        // SScolors[data.sender] = "blue"; // = getRandomColor();
        getRandomColor(data.sender);
      }
      // console.log(usedColors);
      // console.log(getRandomColor());
      bckgrnd = SScolors[data.sender];
      // console.log("background is "+bckgrnd);
      count++; // for deciding background color of input fields
      bckgrnd = (count%2!=0 ? "#eee" : "white");

      width = getWidthOfText(data.message, ffamily, fsize);

      var $message = $("<li>"+
                        "<input class='m' style='background:" + bckgrnd + "; width:"+ width +"px;'></input>" + 
                        "<span><i> -- " + data.sender + "</i></span>" 
                      + "</li>");
      // $('#messages').append($('<li>').text(data.message)); // original
      $('#messages').append($message);
      $('input.m').last().val(data.message);
      scrollBottom(); // scrolls to bottom of page
    
  })
  .on('teacher text', function(data){

      count++; // for input colors above

      var $message = $("<li style='background:red;'>"+ data.message 
                        + "<span><i> -- " + data.sender + "</i></span>" 
                      + "</li>");
      // $('#messages').append($('<li>').text(data.message));
      $('#messages').append($message);
      scrollBottom(); // scrolls to bottom of page
    
  });


  function scrollBottom() {
    window.scrollTo(0,document.body.scrollHeight);
  }

  function getWidthOfText(txt, fontname, fontsize){
    // console.log($('#dummyspan').css({"font-size": fontsize+'px', "font-family": fontname}).text(txt).width());
    var width = $('#dummyspan').css({"font-size": fontsize+'px', "font-family": fontname}).text(txt).width();
    $('#dummyspan').text('');
    return width+width*0.3; // it was a little too short, so add an extra 30%
  }

  function getRandomColor(user){
    var hex, 
        rand=0,
        len = possColors.length, 
        newFound=false;
    // console.log(usedColors.indexOf(possColors[rand]));
    if (usedColors.length == len) { 
      usedColors = []; // clear the usedColors array
    }

    while(newFound==false && usedColors.length != 0){
      // generate random number between 0 and length of possColors array
      rand = Math.floor((Math.random() * len));
      // console.log(rand);
      // if the color isn't in the usedColors array, then use it
      if(usedColors.indexOf(possColors[rand]) == -1) { newFound=true; } 
      // hex = generate random hex value
    }
    
    console.log(rand + " was found");
    usedColors.push(possColors[rand]);
    SScolors[user] = possColors[rand];
    console.log(SScolors[user]);
    // return possColors[rand];
  }

});