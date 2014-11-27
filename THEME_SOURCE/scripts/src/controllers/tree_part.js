/**
 * Created by karkaz on 20/08/14.
 */
(function($){
    app.controller = app.controller || {};
    app.controller.tree_part = {

        zones: {
            'branch': [
                {
                    'zone': 'one',
                    'title': 'Zone #1'
                },
                {
                    'zone': 'two',
                    'title': 'Zone #2'
                },
                {
                    'zone': 'three',
                    'title': 'Zone #3'
                }
            ],
            'trunk': [
                {
                    'zone': 'e',
                    'title': 'East'
                },
                {
                    'zone': 's',
                    'title': 'South'
                },
                {
                    'zone': 'w',
                    'title': 'West'
                }
            ]
        },

        pagecreate : function(){
            _log('tree_part: pagecreate.');
                    },

        pagecontainershow: function() {
            _log('tree_part: pagecontainershow.');

            //set header
            var heading = "";
            var type = app.storage.tmpGet(app.controller.record.TYPE);
            var part = app.storage.tmpGet(app.controller.record.PART);
            switch (type){
                case 'trunk':
                    heading = 'Trunk ' + part;
                    break;
                case 'branch':
                    heading = 'Branch ' + part;
                    break;
                default:
                    heading = 'ERROR';
            }
            $('#tree_part_heading').text(heading);

            this.renderButtons(type);
        },

        /**
         * Renders the UI (buttons)
         */
        renderButtons: function(type){
            var template = $('#part-template').html();

            var template_data = {
                'zone': this.zones[type]
            };

            template_data['trunk'] = app.storage.tmpGet(app.controller.record.TYPE) == 'trunk';

            var placeholder = $('#part-placeholder');
            var compiled_template = Handlebars.compile(template);

            app.controller.tree_part.addSelectedSpecies(template_data);

            placeholder.html(compiled_template(template_data));
            placeholder.trigger('create');

            //button listeners
            $('a.zone').on('click', function(){
                //change the state of the recording: what tree and part of it we are now recording
                var zone = $(this).data('zone');
                app.storage.tmpSet(app.controller.record.ZONE, zone);
            });
        },

        /**
         * Prepares the selected species data for the buttons template.
         *
         * @param part
         * @returns {{}}
         */
        addSelectedSpecies: function(template_data){

            function core(zone){
                var zone_species = app.controller.list.getSavedZoneSpecies(zone.zone);

                if (zone_species.length > 0) {
                    var species_categorized = app.controller.list.categorizeSpecies(zone_species);
                    zone.results = {
                        'tolerant': species_categorized.tolerant.length,
                        'sensitive': species_categorized.sensitive.length
                    }
                } else {
                    delete zone.results;
                }
            }

            for(var i=0; i < template_data.zone.length; i++){
                core(template_data.zone[i]);
            }
        }

    };

}(jQuery));