
$(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").removeClass("navbar-transparent");
    } else {
        $(".navbar-fixed-top").addClass("navbar-transparent");
    }
});

$(document).ready(function() {
  $('a.page-scroll').bind('click', function(event) {
      var $anchor = $(this);
      $('html, body').stop().animate({
          scrollTop: $($anchor.attr('href')).offset().top-60
      }, 1500, 'easeInOutExpo');
      event.preventDefault();
  });
    
    
  $('.navbar-collapse a').click(function(){
      $(".navbar-collapse").collapse('hide');
  });

  $('.contact-form').submit(function(event) {
    $('.contact-form').hide( 400, function() {
     $('.spinner').fadeIn();  
  });
  
   var formData = {
       'name'    : $('input[name=name]').val(),
       'email'   : $('input[name=email]').val(),
       'company' : $('input[name=company]').val(),
       'city'    : $('input[name=city]').val()
   };
   $.ajax({
    type        : 'POST',
    url         : '.', 
    data        : formData,
    dataType    : 'json', 
    encode          : true
    }).done(function(data) {
      $('.spinner').fadeOut();
      $('.ty').fadeIn();
       console.log(data); 
    });
   event.preventDefault();
  });

});
