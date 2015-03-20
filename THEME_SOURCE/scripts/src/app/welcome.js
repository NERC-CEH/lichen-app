/**
 * Created by karkaz on 20/08/14.
 */
(function ($) {
  window.app = window.app || {};
  app.controller = app.controller || {};
  app.controller.welcome = {

    pagecreate: function () {
      _log('welcome: pagecreate.', log.DEBUG);

      $('#record-button').on('click', function () {
        morel.storage.tmpSet(app.controller.record.RECORDING, true);
      });
    },

    pagecontainershow: function (e, data) {
      _log('welcome: pagecontainershow', log.DEBUG);
      morel.storage.tmpSet(app.controller.record.RECORDING, false);

      setTimeout(function(){
        app.download();
      }, 500)
    }
  };

}(jQuery));