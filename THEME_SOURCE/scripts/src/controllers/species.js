(function($){
    app.controller = app.controller || {};
    app.controller.species = {
        pagecreate: function(){

        },

        pagecontainershow: function(event, ui){
            _log('species: pagecontainershow.');
            //var id = app.controller.list.getCurrentSpecies().id;

            var template = $('#species-template').html();
            var placeholder = $('#species-placeholder');

            var compiled_template = Handlebars.compile(template);

            var species = app.controller.list.getCurrentSpecies();

            placeholder.html(compiled_template(species));
            placeholder.trigger('create');
        }

    };
}(jQuery));

