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

    /**
     * Shows user messages to guide through app use: saving to home screen & downloading
     *
     * Fixing iOS 8.x reloading problem - disabling downloading on non app-mode
     */
    trip: function () {
      //check if we are NOT in a HOME-MODE
      if(app.browser.isMobile() && !app.browser.isHomeMode()) {

        //proceed only if the user has NOT CANCELED the dialog future showings
        var homeScreenShown = morel.settings('homescreen');
        if (!homeScreenShown) {
          setTimeout(function(){
            var finishedBtnCloseId = 'finished-ok-button';

            var addingToHomeScreen = '<p>1. Open <strong>Browser Options</strong></p>' +
              '<p>2. Tap <strong>Add to Home Screen</strong></p>';
            var appModeCheckbox = "app-mode-checkbox"; //checkbox used in Safari non-app-mode

            //if iOS then we need to show different options
            if(app.browser.isIOS()){
              addingToHomeScreen =
                '<img id="safari-add-homescreen" src="' + Drupal.settings.themePath + '/images/add_homescreen.png">';

              //iOS 8.x fix
              addingToHomeScreen += '<label><input id="' + appModeCheckbox + '" type="checkbox" name="checkbox-0 ">Don\'t ask again' +
              '</label> </br>';
            }

            var message = '<center><h2>Add to Homescreen</h2></center>' +
              addingToHomeScreen +
              '<button id="' + finishedBtnCloseId + '">OK</button>';

            app.message(message, 0);

            $('#' + finishedBtnCloseId ).on('click', function () {
              //iOS 8.x fix
              if (app.browser.isIOS()) {
                if ($('#'  + appModeCheckbox).prop('checked')) {
                  morel.settings('homescreen', true);
                }
                $.mobile.loading('hide');
              } else {
                //normal behaviour
                morel.settings('homescreen', true);
                if (app.CONF.FEATURES.OFFLINE) {
                  app.download();
                }
              }
            });
          }, 500);

          return;
        } else {
          //iOS 8.x fix
          if (app.browser.isIOS()) {
            return;
          }
        }
      }

      //in case the home screen mode was not detected correctly
      if (app.CONF.FEATURES.OFFLINE){
        setTimeout(app.download, 500);
      }
    }
  };

}(jQuery));