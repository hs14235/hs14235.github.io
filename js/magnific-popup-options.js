$(document).ready(function() {
  // MagnificPopup
  var magnifPopup = function() {
    $('.image-popup').magnificPopup({
      type: 'image',
      removalDelay: 300,
      mainClass: 'mfp-with-zoom',
      gallery:{
        enabled:true
      },
      zoom: {
        enabled: true, // By default it's false, so don't forget to enable it

        duration: 300, // duration of the effect, in milliseconds
        easing: 'ease-in-out', // CSS transition easing function

        // The "opener" function should return the element from which popup will be zoomed in
        // and to which popup will be scaled down
        // By defailt it looks for an image tag:
        opener: function(openerElement) {
        // openerElement is the element on which popup was initialized, in this case its <a> tag
        // you don't need to add "opener" option if this code matches your needs, it's defailt one.
        return openerElement.is('img') ? openerElement : openerElement.find('img');
        }
      }
    });
  };

  var mediaPopup = function() {
    var items = $('.media-popup');
    var viewer = $('#media-gallery-modal');
    var currentIndex = 0;
    var touchStartX = null;

    if (!items.length) {
      return;
    }

    if (!viewer.length) {
      viewer = $(
        '<div id="media-gallery-modal" class="media-gallery-modal" aria-hidden="true">' +
          '<div class="media-gallery-backdrop"></div>' +
          '<div class="media-gallery-dialog" role="dialog" aria-modal="true" aria-label="Gulfstream media gallery">' +
            '<button type="button" class="media-gallery-close" aria-label="Close gallery">&times;</button>' +
            '<button type="button" class="media-gallery-nav media-gallery-prev" aria-label="Previous media">&#10094;</button>' +
            '<div class="media-gallery-stage-wrap">' +
              '<button type="button" class="media-gallery-hit media-gallery-hit-left" aria-label="Previous media"></button>' +
              '<div class="media-gallery-stage"></div>' +
              '<button type="button" class="media-gallery-hit media-gallery-hit-right" aria-label="Next media"></button>' +
            '</div>' +
            '<button type="button" class="media-gallery-nav media-gallery-next" aria-label="Next media">&#10095;</button>' +
            '<div class="media-gallery-meta">' +
              '<p class="media-gallery-caption"></p>' +
            '</div>' +
          '</div>' +
        '</div>'
      ).appendTo('body');
    }

    var stage = viewer.find('.media-gallery-stage');
    var caption = viewer.find('.media-gallery-caption');

    var stopPlayback = function() {
      stage.find('video').each(function() {
        this.pause();
        this.currentTime = 0;
      });
    };

    var extractYouTubeVideoId = function(rawUrl) {
      if (!rawUrl) {
        return '';
      }

      try {
        var url = new URL(rawUrl, window.location.href);
        var pathParts = url.pathname.split('/').filter(Boolean);

        if (url.hostname.indexOf('youtu.be') !== -1) {
          return pathParts[0] || '';
        }

        if (url.searchParams.get('v')) {
          return url.searchParams.get('v');
        }

        if (pathParts[0] === 'embed' && pathParts[1]) {
          return pathParts[1];
        }

        return pathParts[pathParts.length - 1] || '';
      } catch (error) {
        return '';
      }
    };

    var renderMedia = function(index) {
      var element = items.eq(index);
      var src = element.attr('href') || '';
      var mediaType = element.data('mediaType') || 'image';
      var embedUrl = element.data('embedUrl') || '';
      var text = element.data('caption') || element.attr('title') || '';
      var videoId = extractYouTubeVideoId(embedUrl || src);

      currentIndex = index;
      stopPlayback();
      stage.empty();

      if (mediaType === 'video') {
        var video = $('<video>', {
          controls: true,
          playsinline: true,
          preload: 'metadata',
          autoplay: true
        });

        $('<source>', {
          src: src,
          type: 'video/mp4'
        }).appendTo(video);

        video.appendTo(stage);

        var videoNode = video.get(0);
        if (videoNode && videoNode.play) {
          var playAttempt = videoNode.play();
          if (playAttempt && playAttempt.catch) {
            playAttempt.catch(function() {});
          }
        }
      } else if (mediaType === 'youtube') {
        var watchUrl = videoId ? 'https://www.youtube.com/watch?v=' + encodeURIComponent(videoId) : src;
        var youtubeCard = $('<a>', {
          class: 'media-gallery-youtube-card',
          href: watchUrl,
          target: '_blank',
          rel: 'noopener noreferrer',
          'aria-label': text || 'Watch video on YouTube'
        });

        if (videoId) {
          $('<img>', {
            src: 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg',
            alt: text || 'YouTube video preview'
          }).appendTo(youtubeCard);
        }

        var youtubeOverlay = $('<span>', {
          class: 'media-gallery-youtube-overlay'
        }).appendTo(youtubeCard);

        $('<span>', {
          class: 'media-gallery-youtube-kicker',
          text: 'YouTube Demo'
        }).appendTo(youtubeOverlay);

        $('<span>', {
          class: 'media-gallery-youtube-cta',
          text: 'Watch on YouTube'
        }).appendTo(youtubeOverlay);

        $('<span>', {
          class: 'media-gallery-youtube-note',
          text: 'Opens in a new tab for reliable playback'
        }).appendTo(youtubeOverlay);

        youtubeCard.appendTo(stage);
      } else {
        $('<img>', {
          src: src,
          alt: text
        }).appendTo(stage);
      }

      caption.text(text);
    };

    var openViewer = function(index) {
      renderMedia(index);
      viewer.addClass('is-open').attr('aria-hidden', 'false');
      $('body').addClass('media-gallery-open');
    };

    var closeViewer = function() {
      stopPlayback();
      viewer.removeClass('is-open').attr('aria-hidden', 'true');
      $('body').removeClass('media-gallery-open');
      stage.empty();
    };

    var showNext = function() {
      renderMedia((currentIndex + 1) % items.length);
    };

    var showPrev = function() {
      renderMedia((currentIndex - 1 + items.length) % items.length);
    };

    items.each(function(index) {
      $(this).on('click', function(event) {
        event.preventDefault();
        openViewer(index);
      });
    });

    viewer.find('.media-gallery-close, .media-gallery-backdrop').on('click', function() {
      closeViewer();
    });

    viewer.find('.media-gallery-next, .media-gallery-hit-right').on('click', function(event) {
      event.stopPropagation();
      showNext();
    });

    viewer.find('.media-gallery-prev, .media-gallery-hit-left').on('click', function(event) {
      event.stopPropagation();
      showPrev();
    });

    viewer.find('.media-gallery-dialog').on('click', function(event) {
      event.stopPropagation();
    });

    viewer.find('.media-gallery-stage-wrap').on('touchstart', function(event) {
      touchStartX = event.originalEvent.touches[0].clientX;
    });

    viewer.find('.media-gallery-stage-wrap').on('touchend', function(event) {
      if (touchStartX === null) {
        return;
      }

      var touchEndX = event.originalEvent.changedTouches[0].clientX;
      var deltaX = touchEndX - touchStartX;
      touchStartX = null;

      if (Math.abs(deltaX) < 40) {
        return;
      }

      if (deltaX < 0) {
        showNext();
      } else {
        showPrev();
      }
    });

    $(document).on('keydown.mediaGallery', function(event) {
      if (!viewer.hasClass('is-open')) {
        return;
      }

      if (event.key === 'Escape') {
        closeViewer();
      } else if (event.key === 'ArrowRight') {
        showNext();
      } else if (event.key === 'ArrowLeft') {
        showPrev();
      }
    });
  };

  
  // Call the functions 
  magnifPopup();
  mediaPopup();

});
