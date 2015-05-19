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

      this.loadSpeciesData();

      this.trip();
    },

    pagecontainershow: function (e, data) {
      _log('welcome: pagecontainershow', log.DEBUG);
      morel.storage.tmpSet(app.controller.record.RECORDING, false);
    },

    /**
     * Loads the species data to app.data.species.
     */
    loadSpeciesData: function () {
      //load species data
      if (!morel.storage.is('species')) {
        $.ajax({
          url: app.CONF.SPECIES_DATA_URL,
          dataType: 'jsonp',
          success: function (species) {
            app.data.species = species;

            //saves for quicker loading
            morel.storage.set('species', species);

            $(document).trigger('dataLoaded');
          }
        });
      } else {
        app.data.species = morel.storage.get('species');
      }
    },

    trip: function () {
      if(app.browser.isMobile() && !app.browser.isHomeMode()) {
        var homeScreenShown = morel.settings('homescreen');
        if (!homeScreenShown) {
          setTimeout(function(){
            var finishedBtnCloseId = 'finished-ok-button';

            var addingToHomeScreen = '<p>1. Browser Options<br/> 2. Add to Home Screen</p>';

            if(app.browser.detect('Safari')){
              addingToHomeScreen =
                '<img id="safari-add-homescreen" src="' + Drupal.settings.themePath + '/images/add_homescreen.png">';
            }

            var message =
              '<center><h2>Add to Homescreen</h2></center>' +
              addingToHomeScreen +
              '<button id="' + finishedBtnCloseId + '">OK</button>';

            app.message(message, 0);

            $('#' + finishedBtnCloseId ).on('click', function () {
              if (app.CONF.FEATURES.OFFLINE) {
                morel.settings('homescreen', true);
                app.download();
              }
            });
          }, 500);
          return;
        }
      }

      //in case the home screen mode was not detected correctly
      if (app.CONF.FEATURES.OFFLINE){
        setTimeout(app.download, 500);
      }
    }
  };

}(jQuery));