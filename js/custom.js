"use strict";

(function ($) {
  var wow;

  function prefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

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

  function getPageScrollRoot() {
    return document.body.scrollHeight > document.documentElement.scrollHeight
      ? document.body
      : document.scrollingElement;
  }

  var scrollAnimationFrame;
  function animatePageScroll(scrollRoot, targetTop) {
    if (prefersReducedMotion()) {
      scrollRoot.scrollTop = targetTop;
      return;
    }

    var startTop = scrollRoot.scrollTop;
    var distance = targetTop - startTop;
    var startTime = performance.now();

    window.cancelAnimationFrame(scrollAnimationFrame);
    function step(timestamp) {
      var elapsed = Math.min(1, (timestamp - startTime) / 720);
      var eased = 1 - Math.pow(1 - elapsed, 3);
      scrollRoot.scrollTop = startTop + distance * eased;

      if (elapsed < 1) {
        scrollAnimationFrame = window.requestAnimationFrame(step);
      }
    }

    scrollAnimationFrame = window.requestAnimationFrame(step);
  }

  function initRevealSystem() {
    if (prefersReducedMotion()) {
      document.documentElement.classList.add("reduced-motion");
      document.querySelectorAll(".wow").forEach(function (element) {
        element.style.visibility = "visible";
      });
      return;
    }

    wow = new WOW({
      mobile: true,
      live: true,
      offset: 16
    });

    // Scale-aware visibility fix for desktop zoom so WOW triggers at the right time.
    wow.isVisible = function (box) {
      var offset = box.getAttribute("data-wow-offset") || this.config.offset;
      var pageScrollRoot = getPageScrollRoot();
      var pageTop = pageScrollRoot.scrollTop;
      var scale = getDesktopScale();
      var viewportHeight = Math.min(this.element.clientHeight, this.util().innerHeight()) / scale;
      var viewBottom = pageTop + viewportHeight + getRevealLead() - offset;
      var top = this.offsetTop(box);
      var bottom = top + box.clientHeight;

      return viewBottom >= top && bottom >= pageTop;
    };

    wow.init();

    var pageScrollRoot = getPageScrollRoot();
    if (pageScrollRoot !== window) {
      pageScrollRoot.addEventListener("scroll", function () {
        $(window).trigger("scroll");
      }, { passive: true });
    }
  }

  function initCriticalReveal() {
    var criticalBlocks = document.querySelectorAll(".critical-reveal");
    if (!criticalBlocks.length) {
      return;
    }

    if (prefersReducedMotion()) {
      criticalBlocks.forEach(function (block) {
        block.classList.add("is-visible");
      });
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

  function initPortfolioNavigation() {
    var progressBar = document.getElementById("reading-progress-bar");
    var navLinks = document.querySelectorAll(".portfolio-rail-nav a[data-section]");
    var sections = document.querySelectorAll("section[id]");

    if (!progressBar || !navLinks.length || !sections.length) {
      return;
    }

    function updateNavigation() {
      var scrollRoot = getPageScrollRoot();
      var scrollableHeight = scrollRoot.scrollHeight - window.innerHeight;
      var progress = scrollableHeight > 0 ? (scrollRoot.scrollTop / scrollableHeight) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, progress)) + "%";

      var activeSection = sections[0].id;
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.32) {
          activeSection = section.id;
        }
      });

      navLinks.forEach(function (link) {
        var isActive = link.getAttribute("data-section") === activeSection;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    window.addEventListener("scroll", updateNavigation, { passive: true });
    getPageScrollRoot().addEventListener("scroll", updateNavigation, { passive: true });
    window.addEventListener("resize", updateNavigation);
    updateNavigation();
  }

  $(window).on("load", function () {
    if (prefersReducedMotion()) {
      $(".preloader").hide();
    } else {
      $(".preloader").fadeOut(1000);
    }

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

    var scrollRoot = getPageScrollRoot();
    var targetTop = target.getBoundingClientRect().top + scrollRoot.scrollTop - 12;
    animatePageScroll(scrollRoot, Math.max(0, targetTop));

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", targetSelector);
    } else {
      window.location.hash = targetSelector;
    }
  });

  function initParallax() {
    if (!prefersReducedMotion() && $(window).width() > 992 && !shouldUseScaledDesktopLayout()) {
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
  initPortfolioNavigation();

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
