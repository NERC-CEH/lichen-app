/**
 * Created by karkaz on 20/08/14.
 */
(function ($) {
  window.app = window.app || {};
  app.controller = app.controller || {};
  app.controller.compass = {
    lastUpdate: 0,
    UPDATE_TIME_DIFF: 10, //ms

    pagecreate: function () {
      _log('compass: pagecreate', morel.LOG_DEBUG);
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function (event) {
          var date = new Date();
          var now = date.getTime();
          var nextRotTime = app.controller.compass.lastUpdate + app.controller.compass.UPDATE_TIME_DIFF;

          if (nextRotTime < now) {
            app.controller.compass.lastUpdate = now;
            app.controller.compass.rotateRose(event);
          }
        });
      }
    },

    rotateRose: function (event) {
      var compass = document.getElementById('windrose');
      var alpha, webkitAlpha;

      //Check for iOS property
      if (event.webkitCompassHeading) {
        alpha = event.webkitCompassHeading;
        //Rotation is reversed for iOS
        compass.style.WebkitTransform = 'rotate(-' + alpha + 'deg)';
      } else {
        //non iOS
        alpha = event.alpha;
        webkitAlpha = alpha;
        if (!window.chrome) {
          //Assume Android stock (this is crude, but good enough for our example) and apply offset
          webkitAlpha = alpha - 270;
        }
      }

      _log('compass: rotate ' + alpha, morel.LOG_DEBUG);

      //Rotate the rose
      compass.style.Transform = 'rotate(' + alpha + 'deg)';

      if (webkitAlpha != null) {
        compass.style.WebkitTransform = 'rotate(' + webkitAlpha + 'deg)';
      }

      //Rotation is reversed for FF
      compass.style.MozTransform = 'rotate(-' + alpha + 'deg)';
    }
  };

}(jQuery));