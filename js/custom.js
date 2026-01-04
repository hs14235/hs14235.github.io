(function ($) {
  "use strict";

  // PRE LOADER
  $(window).on('load', function () {
    $('.preloader').fadeOut(1000);
  });

  // navigation Section
  $('.navbar-collapse a').on('click', function () {
    $(".navbar-collapse").collapse('hide');
  });

  // Parallax Js (desktop only)
  function initParallax() {
    if ($(window).width() > 992) {
      $('#home').parallax("50%", 50);
      $('#service').parallax("50%", 40);
      $('#about').parallax("50%", 20);
      $('#work').parallax("50%", 30);
      $('#contact').parallax("50%", 10);
    }
  }
  initParallax();

  // smoothscroll js (all internal anchors)
  $(function () {
    $('a[href^="#"]').on('click', function (event) {
      var target = $(this.getAttribute('href'));
      if (target.length) {
        event.preventDefault();
        $('html, body').stop().animate({
          scrollTop: target.offset().top - 49
        }, 600);
      }
    });
  });

  // WOW Animation js
  new WOW({
    mobile: true,
    live: true
  }).init();

})(jQuery);
