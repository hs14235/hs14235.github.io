"use strict";

(function ($) {
  var wow;

  function getDesktopScale() {
    if (!window.matchMedia("(min-width: 992px)").matches) {
      return 1;
    }

    var scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--site-scale"));
    return isFinite(scale) && scale > 0 ? scale : 1;
  }

  function shouldUseScaledDesktopLayout() {
    return Math.abs(getDesktopScale() - 1) > 0.001;
  }

  function getRevealLead() {
    return shouldUseScaledDesktopLayout() ? 180 : 32;
  }

  function initRevealSystem() {
    wow = new WOW({
      mobile: true,
      live: true,
      offset: 16
    });

    // Scale-aware visibility fix for desktop zoom so WOW triggers at the right time.
    wow.isVisible = function (box) {
      var offset = box.getAttribute("data-wow-offset") || this.config.offset;
      var pageTop = window.pageYOffset;
      var scale = getDesktopScale();
      var viewportHeight = Math.min(this.element.clientHeight, this.util().innerHeight()) / scale;
      var viewBottom = pageTop + viewportHeight + getRevealLead() - offset;
      var top = this.offsetTop(box);
      var bottom = top + box.clientHeight;

      return viewBottom >= top && bottom >= pageTop;
    };

    wow.init();
  }

  function initCriticalReveal() {
    var criticalBlocks = document.querySelectorAll(".critical-reveal");
    if (!criticalBlocks.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      criticalBlocks.forEach(function (block) {
        block.classList.add("is-visible");
        if (wow && block.classList.contains("wow")) {
          wow.show(block);
        }
      });
      return;
    }

    criticalBlocks.forEach(function (block) {
      var thresholdAttr = parseFloat(block.getAttribute("data-reveal-threshold"));
      var threshold = isFinite(thresholdAttr) ? thresholdAttr : 0.08;
      var rootMargin = block.getAttribute("data-reveal-margin") || "0px 0px 14% 0px";
      var observer = new IntersectionObserver(function (entries, io) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (wow && entry.target.classList.contains("wow")) {
              wow.show(entry.target);
            }
            io.unobserve(entry.target);
          }
        });
      }, {
        threshold: threshold,
        rootMargin: rootMargin
      });

      observer.observe(block);
    });
  }

  function initProjectReadMore() {
    $("#projects .service-thumb").each(function () {
      var card = $(this);
      var description = card.children("p").first();

      if (!description.length || card.find(".project-read-more").length) {
        return;
      }

      card.addClass("has-read-more");

      var button = $('<button type="button" class="project-read-more" aria-expanded="false">Read more</button>');

      button.on("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        var expanded = card.toggleClass("is-expanded").hasClass("is-expanded");
        button.attr("aria-expanded", expanded ? "true" : "false");
        button.text(expanded ? "Show less" : "Read more");
      });

      description.after(button);
    });
  }

  $(window).on("load", function () {
    $(".preloader").fadeOut(1000);

    if (wow) {
      setTimeout(function () {
        wow.sync();
        $(window).trigger("scroll");
        $(window).trigger("resize");
      }, 150);
    }
  });

  $(".navbar-collapse a").on("click", function () {
    $(".navbar-collapse").collapse("hide");
  });

  // Keep the later direct anchor fix so the hero CTA still lands on Projects.
  $(".smoothScroll").off("click").on("click", function (event) {
    var targetSelector = this.getAttribute("href");
    var target = targetSelector ? document.querySelector(targetSelector) : null;

    if (!target) {
      return;
    }

    event.preventDefault();

    var targetTop = target.getBoundingClientRect().top + window.pageYOffset - 12;
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth"
    });

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", targetSelector);
    } else {
      window.location.hash = targetSelector;
    }
  });

  function initParallax() {
    if ($(window).width() > 992 && !shouldUseScaledDesktopLayout()) {
      $("#home").parallax("50%", 50);
      $("#service").parallax("50%", 40);
      $("#about").parallax("50%", 20);
      $("#work").parallax("50%", 30);
      $("#contact").parallax("50%", 10);
    }
  }
  initParallax();

  initRevealSystem();
  initCriticalReveal();
  initProjectReadMore();

  var form = document.getElementById("contact-form");
  var submitBtn = document.getElementById("submitBtn");
  var formFeedback = document.getElementById("formFeedback");

  if (form) {
    form.addEventListener("submit", function () {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Sending...';

      setTimeout(function () {
        if (submitBtn.disabled) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Send Message';
          formFeedback.className = "form-feedback error";
          formFeedback.textContent = "Submission timeout. Please check your connection and try again.";
        }
      }, 10000);
    });

    if (window.location.hash === "#contact" && document.referrer) {
      try {
        var referrerUrl = new URL(document.referrer);
        if (referrerUrl.hostname === "formspree.io") {
          formFeedback.className = "form-feedback success";
          formFeedback.textContent = "Message sent successfully! I will get back to you soon.";
          form.reset();
        }
      } catch (e) {
        // Ignore malformed referrers.
      }
    }
  }
})(jQuery);
