$(function () {
  "use strict";

  var touchsupport =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;
  if (!touchsupport) {
    $("html").addClass("cannotTouch");
  }

  $.fn.gototop = function (opts) {
    var defaults = {
      startFadeIn: 100,
      container: "body",
      toTop: "#toTop",
    };

    var options = $.extend(defaults, opts);
    var items;
    var wasdragging;

    function handle_resize(e) {
      const win = $(this); //this = window
      const $toTop = $("#toTop");

      const docViewTop = win.scrollTop();
      const docViewBottom = docViewTop + win.height();
      const elemTop = $toTop.offset().top;
      const elemBottom = elemTop + $toTop.height();

      const docViewLeft = win.scrollLeft();
      const docViewRight = docViewLeft + win.width();
      const elemLeft = $toTop.offset().left;
      const elemRight = elemLeft + $toTop.width();

      if (elemBottom >= docViewBottom) {
        $toTop.offset({ top: docViewBottom - $toTop.height() - 20 });
      }
      if (elemRight >= docViewRight) {
        $toTop.offset({ left: docViewRight - $toTop.width() - 20 });
      }
    }

    function handle_mousedown(e) {
      var pageX0;
      var pageY0;
      var offset0;
      var dragging;

      function mousemove(e) {
        if (e.pageX !== pageX0 || e.pageY !== pageY0) {
          dragging = true;
          var left = offset0.left + (e.pageX - pageX0);
          var top = offset0.top + (e.pageY - pageY0);
          $(this).offset({ top: top, left: left });
        }
      }

      function mouseup(e) {
        $(this).off("mousemove", mousemove).off("mouseup", mouseup);
        wasdragging = dragging;
        dragging = false;
      }

      pageX0 = e.pageX;
      pageY0 = e.pageY;
      offset0 = $(this).offset();
      dragging = false;
      wasdragging = false;
      $(this).on("mousemove", mousemove).on("mouseup", mouseup);
    }

    function handle_touchstart(e) {
      var touchobj;
      var pageX0;
      var pageY0;
      var offset0;
      var dragging;

      function handle_touchmove(e) {
        var touchobj = e.originalEvent.changedTouches[0];
        if (e.pageX !== pageX0 || e.pageY !== pageY0) {
          dragging = true;
          var left = offset0.left + (touchobj.pageX - pageX0);
          var top = offset0.top + (touchobj.pageY - pageY0);
          $(this).offset({ top: top, left: left });
        }
        e.preventDefault();
      }

      function handle_touchend(e) {
        var touchobj = e.originalEvent.changedTouches[0];
        var left = offset0.left + (touchobj.pageX - pageX0);
        var top = offset0.top + (touchobj.pageY - pageY0);
        wasdragging = dragging;
        dragging = false;
        $(this).offset({ top: top, left: left });
        $(this)
          .off("touchmove", handle_touchmove)
          .off("touchend", handle_touchend);
        $(this).click();
        e.preventDefault();
      }

      touchobj = e.originalEvent.changedTouches[0];
      offset0 = $(this).offset();
      pageX0 = touchobj.pageX;
      pageY0 = touchobj.pageY;
      dragging = false;

      $(this).on("touchmove", handle_touchmove).on("touchend", handle_touchend);
      e.preventDefault();
    }

    if (this.length === 0) {
      $(options.container).prepend(
        '<div id="toTop" title="Go To Top of Page"><i class="fa fa-angle-up fa-3x" aria-hidden="true"></i></div>'
      );
      items = $(options.toTop);
    } else {
      items = this;
    }

    // Plugin code
    return items.each(function () {
      var $top = $(this);

      function fnScroll() {
        if ($(window).scrollTop() > options.startFadeIn) {
          $top.fadeIn().css("display", "inline-block");
        } else {
          $top.fadeOut();
        }
      }

      function orientationchange() {
        $top.css({
          top: $(window).height() - $top.height() - 20,
          left: $(window).width() - $top.width() - 20,
        });
      }

      $top
        .on("mousedown", handle_mousedown)
        .on("touchstart", handle_touchstart);
      $(window).on("load", fnScroll).scroll(fnScroll);
      $(window).on("orientationchange", orientationchange);
      $(window).on("resize", handle_resize);
      orientationchange();

      $top.click(function (e) {
        if (!wasdragging) {
          $("body,html").animate({ scrollTop: 0 }, 800);
        }
        wasdragging = false;
        e.stopImmediatePropagation();
      });
      $(window).trigger("scroll");
    });
  };

  $("#toTop").gototop();
});
