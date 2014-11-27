/**
 * Created by karkaz on 20/08/14.
 */
(function($){
    app.controller = app.controller || {};
    app.controller.record = {

        RECORDING: 'recording',
        SPECIES: 'species',
        TYPE: 'recording_type',
        PART: 'recording_part',
        ZONE: 'recording_zone',

        types: {
            'branch': [
                {
                    'type': 'branch',
                    'part': '1',
                    'title': 'Branch #1'
                },
                {
                    'type': 'branch',
                    'part': '2',
                    'title': 'Branch #2'
                },
                {
                    'type': 'branch',
                    'part': '3',
                    'title': 'Branch #3'
                },
                {
                    'type': 'branch',
                    'part': '4',
                    'title': 'Branch #4'
                },
                {
                    'type': 'branch',
                    'part': '5',
                    'title': 'Branch #5'
                }
            ],
            'trunk': [
                {
                    'type': 'trunk',
                    'part': '1',
                    'title': 'Trunk #1'
                },
                {
                    'type': 'trunk',
                    'part': '2',
                    'title': 'Trunk #2'
                },
                {
                    'type': 'trunk',
                    'part': '3',
                    'title': 'Trunk #3'
                },
                {
                    'type': 'trunk',
                    'part': '4',
                    'title': 'Trunk #4'
                },
                {
                    'type': 'trunk',
                    'part': '5',
                    'title': 'Trunk #5'
                }
            ]
        },

        /**
         * Setting up a recording page.
         */
        pagecreate : function(){
            _log('record: pagecreate.');

            this.saveDate();

            //attach button listeners
            $('#results-button').on('click', function(){
                var valid = app.controller.record.valid();
                if (valid == app.TRUE){
                    $("body").pagecontainer("change", "#results");
                }
            });
        },

        pagecontainershow: function(e, data){
            _log('record: pagecontainershow.');

            var prevPageId = data.prevPage[0].id;
            switch(prevPageId){
                case 'welcome':
//                    //prepare a new record
//                    this.clear();
                    break;
                default:
            }

            this.renderButtons();
        },

        /**
         * Renders the UI (buttons)
         */
        renderButtons: function(){
            var template = $('#type-template').html();

            //branches
            var template_data = this.types.branch;

            this.addSelectedResults(template_data);

            var placeholder = $('#branch-placeholder');
            var compiled_template = Handlebars.compile(template);

            placeholder.html(compiled_template(template_data));
            placeholder.trigger('create');

            //trunks
            template_data = this.types.trunk;

            this.addSelectedResults(template_data);

            placeholder = $('#trunk-placeholder');
            compiled_template = Handlebars.compile(template);

            placeholder.html(compiled_template(template_data));
            placeholder.trigger('create');

            //attach button listeners
            $('.record-button').on('click', function(){
                //change the state of the recording: what tree and part of it we are now recording
                var type = $(this).data('type');
                var part = $(this).data('part');

                app.storage.tmpSet(app.controller.record.TYPE, type);
                app.storage.tmpSet(app.controller.record.PART, part);
            });
        },

        /**
         * Appends progress info to the template data.
         */
        addSelectedResults: function(data){
            var species = app.controller.list.getAllSpecies();

            for (var i = 0; i < data.length; i++){
                var type = species[data[i].type];
                var part = type[data[i].part];

                if(part != null){
                    var keys = Object.keys(part);
                    var modified = 0;

                    //cuunt how many have entries
                    for (var j = 0; j < keys.length; j++){
                        if (part[keys[j]].length > 0){
                            modified++;
                        }
                    }

                    data[i].results = Math.round((modified / 3) * 100);
                } else {
                    //if part not recorded or empty (0%), don't display
                    delete data[i].results;
                }
            }

        },

        /**
         * Clears the recording page from existing inputs.
         */
        clear: function(){
            _log('record: clearing recording page.');
            app.record.clear();
            this.saveDate();
        },


        /**
         * Validates the record and GPS lock. If not valid then
         * takes some action - popup/gps page redirect.
         * @returns {*}
         */
        valid: function(){
            //validate record
            var invalids = this.validateInputs();
            if (invalids.length > 0) {
                var message =
                    "<p>The following is still missing:</p><ul>";

                for (var i=0; i < invalids.length; i++){
                    message += "<li>" + invalids[i].name + "</li>";
                }

                message += "</ul>";
                //app.navigation.popup(message, true);
                app.navigation.message(message);
                return app.FALSE;
            }

            //validate gps
            var gps = app.geoloc.valid();
            if (gps == app.ERROR || gps == app.FALSE){
                //redirect to gps page
                $('body').pagecontainer( "change", "#sref");
                return app.FALSE;
            }
            return app.TRUE;
        },

        /**
         * Validates the record inputs.
         */
        validateInputs: function(){
            var invalids = [];
            //core inputs
            if(!app.record.inputs.is('sample:date')){
                invalids.push({
                    'id': 'sample:date',
                    'name': 'Date'
                })
            }
            if(!app.record.inputs.is('sample:entered_sref')){
                invalids.push({
                    'id': 'sample:entered_sref',
                    'name': 'Location'
                })
            }
            //NAQI data

            return invalids;
        },

        saveSref : function(location){
            if (location == null){
                return app.ERROR;
            }
            var sref = location.lat + ', ' + location.lon;
            var sref_system = "4326";
            var sref_accuracy = location.acc;
            app.record.inputs.set(app.record.inputs.KEYS.SREF, sref);
            app.record.inputs.set(app.record.inputs.KEYS.SREF_SYSTEM, sref_system);
            app.record.inputs.set(app.record.inputs.KEYS.SREF_ACCURACY, sref_accuracy);
        },

        /**
         * Saves the user comment into current record.
         */
        saveInput: function(name){
            if (name == null && name == ""){
                _log('record: ERROR, no input name provided.');
                return app.ERROR;
            }
            var ele = document.getElementById(name);
            var value = $(ele).val();
            if (value != "") {
                app.record.inputs.set(name, value);
            }
        },

        /**
         * Saves the selected species into current record.
         */
        saveSpecies: function(){
            var specie = app.controller.list.getCurrentSpecies();
            if (specie != null && specie.warehouse_id != null && specie.warehouse_id != ""){
                var name = 'occurrence:taxa_taxon_list_id';
                var value = specie.warehouse_id;
                app.record.inputs.set(name, value);

                //add header to the page
                $('#record_heading').text(specie.common_name);
            } else {
                _log('record: ERROR no species was found. Nothing attached to the recording.');
            }
        },

        /**
         * Saves the current date and populates the date input.
         */
        saveDate: function(){
            var now = new Date();
            var day = ("0" + now.getDate()).slice(-2);
            var month = ("0" + (now.getMonth() + 1)).slice(-2);

            var value = now.getFullYear()+"-"+(month)+"-"+(day) ;
            var name = 'sample:date';

            var ele = document.getElementById(name);
            $(ele).val(value);

            app.record.inputs.set(name, value);
        },

        gpsButtonState: function(state){
            var button = $('#sref-top-button');
            switch(state){
                case 'running':
                    button.addClass('running');
                    button.removeClass('done');
                    button.removeClass('none');
                    break;
                case 'done':
                    button.addClass('done');
                    button.removeClass('running');
                    button.removeClass('none');
                    break;
                case 'none':
                    button.addClass('none');
                    button.removeClass('done');
                    button.removeClass('running');
                    break;
                default:
                    _log('record: ERROR no such GPS button state.');
            }
        }
    };

}(jQuery));