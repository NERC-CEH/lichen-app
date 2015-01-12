/**
 * Created by karkaz on 20/08/14.
 */
(function ($) {
  app.controller = app.controller || {};
  app.controller.welcome = {

    pagecreate: function () {
      _log('welcome: pagecreate.', app.LOG_DEBUG);

      $('#record-button').on('click', function () {
        app.storage.tmpSet(app.controller.record.RECORDING, true);
      });
    },

    pagecontainershow: function (e, data) {
      _log('welcome: pagecontainershow', app.LOG_DEBUG);
      app.storage.tmpSet(app.controller.record.RECORDING, false);
    }

  };

}(jQuery));