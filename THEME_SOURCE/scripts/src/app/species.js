(function ($) {
  window.app = window.app || {};
  app.controller = app.controller || {};
  app.controller.species = {
    pagecreate: function () {

    },

    pagecontainershow: function (event, ui) {
      _log('species: pagecontainershow.');
      //var id = app.controller.list.getCurrentSpecies().id;

      var template = $('#species-template').html();
      var placeholder = $('#species-placeholder');

      var compiled_template = Handlebars.compile(template);

      var species = app.controller.list.getCurrentSpecies();

      if (species.confusion_image_1.length || species.confusion_image_2.length){
        species.confusion_images = [
          species.confusion_image_1,
          species.confusion_image_2
        ];
      }

      placeholder.html(compiled_template(species));
      placeholder.trigger('create');

      $('#confusion-species-button').on('click', function () {
        $('#confusion-species-gallery').toggle();
      });
    }

  };
}(jQuery));

