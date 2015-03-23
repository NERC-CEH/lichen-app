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

      setTimeout(function(){
        app.download();
      }, 500);
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
    }
  };

}(jQuery));