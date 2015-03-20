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
        //app.controller.welcome.download();
      }, 500)
    },

    /**
     * Asks the user to start an appcache download
     * process.
     */
    download: function () {
      var OFFLINE = 'offline';
      var offline = morel.settings(OFFLINE);

      if (offline == null || (!offline['downloaded'] && !offline['dontAsk'])) {
        var donwloadBtnId = "download-button";
        var donwloadCancelBtnId = "download-cancel-button";
        var downloadCheckbox = "download-checkbox";

        //ask the user
        var message =
          'Start downloading the app for offline use?</br>' +

          '<label><input id="' + downloadCheckbox + '" type="checkbox" name="checkbox-0 ">Don\'t ask again' +
          '</label> </br>' +

          '<a href="#" id="' + donwloadBtnId + '"' +
          'class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Download</a>' +
          '<a href="#" id="' + donwloadCancelBtnId + '"' +
          'class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Cancel</a>';

        app.message(message);

        $('#' + donwloadBtnId).on('click', function () {
          _log('list: starting appcache downloading process.');

          //for some unknown reason on timeout the popup does not disappear
          setTimeout(function () {
            function onSuccess() {
              offline = {
                'downloaded': true,
                'dontAsk': false
              };
              morel.settings(OFFLINE, offline);
              jQuery.mobile.loading('hide');
              location.reload();
            }

            function onError() {
              _log('list: ERROR appcache.');
            }

            startManifestDownload('appcache', 114,
              app.CONF.APPCACHE_LOADER_URL, onSuccess, onError);
          }, 500);

        });

        $('#' + donwloadCancelBtnId).on('click', function () {
          _log('list: appcache dowload canceled.');
          var dontAsk = $('#' + downloadCheckbox).prop('checked');
          offline = {
            'downloaded': false,
            'dontAsk': dontAsk
          };

          morel.settings(OFFLINE, offline);
        });
      }
    }

  };

}(jQuery));