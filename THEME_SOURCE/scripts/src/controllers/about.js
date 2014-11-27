/**
 * Created by karkaz on 20/08/14.
 */
(function($){
    app.controller = app.controller || {};
    app.controller.about = {

        pagecontainershow: function(){
            var template = $('#app-version-template').html();
            var placeholder = $('#app-version-placeholder');

            var compiled_template = Handlebars.compile(template);

            placeholder.html(compiled_template({'version' : app.controller.version}));
            placeholder.trigger('create');
        }

    };

}(jQuery));