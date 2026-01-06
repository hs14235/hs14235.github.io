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

  // Contact Form Enhancement
  var form = document.getElementById('contact-form');
  var submitBtn = document.getElementById('submitBtn');
  var formFeedback = document.getElementById('formFeedback');
  
  if (form) {
    form.addEventListener('submit', function(e) {
      // Only enhance, don't prevent default - let Formspree handle it
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Sending...';
      
      // Add timeout to re-enable button in case of issues
      setTimeout(function() {
        if (submitBtn.disabled) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Send Message';
          formFeedback.className = 'form-feedback error';
          formFeedback.textContent = 'Submission timeout. Please check your connection and try again.';
        }
      }, 10000);
    });
    
    // Handle Formspree redirect by checking URL hash
    if (window.location.hash === '#contact' && document.referrer.includes('formspree.io')) {
      formFeedback.className = 'form-feedback success';
      formFeedback.textContent = '✓ Message sent successfully! I will get back to you soon.';
      form.reset();
    }
  }

})(jQuery);
