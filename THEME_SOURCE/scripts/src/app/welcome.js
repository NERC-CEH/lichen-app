/**
 * Created by karkaz on 20/08/14.
 */
(function ($) {
  window.app = window.app || {};
  app.controller = app.controller || {};
  app.controller.welcome = {

    pagecreate: function () {
      _log('welcome: pagecreate.', morel.LOG_DEBUG);

      $('#record-button').on('click', function () {
        morel.storage.tmpSet(app.controller.record.RECORDING, true);
      });
    },

    pagecontainershow: function (e, data) {
      _log('welcome: pagecontainershow', morel.LOG_DEBUG);
      morel.storage.tmpSet(app.controller.record.RECORDING, false);
    }

  };

}(jQuery));