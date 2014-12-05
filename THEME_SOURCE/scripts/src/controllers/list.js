/**
 *
 */

(function($){
    app.controller = app.controller || {};
    app.controller.list = {
        //controller configuration should be set up in an app config file
        CONF: {
            PROB_DATA_SRC: "",
            SPECIES_DATA_SRC: ""
        },

        DEFAULT_SORT : 'taxonomic',

        /**
         *
         */
        pagecreate : function(){
            _log('list: pagecreate.');

            this.loadSpeciesData();

            //ask user to appcache
            //setTimeout(app.controller.list.download, 1000);
        },

        /**
         *
         */
        pagecontainershow: function(){
            _log('list: pagecontainershow.');

            //set header
            var heading = "Lichen IDs";
            var recording = app.storage.tmpGet(app.controller.record.RECORDING);
            if (recording){
                var zone = app.storage.tmpGet(app.controller.record.ZONE);
                var type = app.storage.tmpGet(app.controller.record.TYPE);

                var zones = app.controller.tree_part.zones[type];
                var zoneId = null;
                for (var i= 0; i < zones.length; i++){
                    if(zones[i].zone == zone){
                        heading = zones[i].title;
                        zoneId = i;
                        break;
                    }
                }

                //set Next button
                $('#zone-next-button').show();
                app.controller.list.setNextButton(zones, zoneId);
            } else {
                //turn off Next button
                $('#zone-next-button').hide();
            }
            $('#list_heading').text(heading);

            app.controller.list.renderList(function(){
                $('.species-list-button').each(function(index, value){
                    var id = $(this).data('speciesid');
                    $(this).on('click', function(){
                        app.controller.list.setCurrentSpecies(id);
                    });
                });
                $('.species-list-checkbox-button').each(function(index, value){
                    var id = $(this).data('speciesid');
                    $(this).on('click', function(){
                        app.controller.list.setCurrentSpecies(id);
                    });
                });

                //if recording assign list checkbox event listeners
                var recording = app.storage.tmpGet(app.controller.record.RECORDING);
                if (recording){
                    $('.species-list-checkbox-button > div > input').on('change', function(index, value){
                        var zone = app.storage.tmpGet(app.controller.record.ZONE);

                        var id = $(this).data('speciesid');
                        var checked =  $(this).is(':checked');
                        app.controller.list.setSavedZoneSpecies(zone, id, checked);
                    });
                }
            });
        },

        /**
         * Sets the next part button.
         * @param heading
         * @param type
         * @param part
         */
        setNextButton: function(zones, zoneId){
            //set next button
            var zone_next = $('#zone-next-button');

            zone_next.unbind('click'); //remove previous handlers
            //set the state update upon click
            zone_next.on('click', function(){
                //change the state of the recording: what tree and part of it we are now recording
                var zone = $(this).data('zone');
                app.storage.tmpSet(app.controller.record.ZONE, zone);
            });

            if (++zoneId < zones.length) {
                zone_next.data('zone', zones[zoneId].zone);
                zone_next.text(zones[zoneId].title);

                //set button listener to refresh the page
                zone_next.on('click', app.controller.list.pagecontainershow); //refresh page
            } else {
                zone_next.text('Finish');

                //set button listener to refresh the page
                zone_next.on('click', function(event){
                    $.mobile.navigate.history.stack.pop(); //remove last entry
                    $('body').pagecontainer( "change", "#tree_part");
                });
            }
        },

        /**
         * Loads the species data to app.data.species.
         */
        loadSpeciesData: function(){
            //load species data
            if(!app.storage.is('species')) {
                app.navigation.message('Loading IDs data for the first time..');
                $.ajax({
                    url: Drupal.settings.basePath + this.CONF.SPECIES_DATA_SRC,
                    dataType: 'jsonp',
                    async: false,
                    success: function (species) {
                        app.navigation.message('Done loading IDs data');
                        app.data.species = species;

                        //saves for quicker loading
                        app.storage.set('species', species);

                        //todo: what if data comes first before pagecontainershow
                        app.controller.list.renderList();
                    }
                });
            } else {
                app.data.species = app.storage.get('species');
            }
        },

        /**
         * gets species from temp storage.
         * @returns {*|{}}
         */
        getAllSpecies: function(){
            return app.record.inputs.get(app.controller.record.SPECIES) || {'trunk': {}, 'branch': {}};
        },

        /**
         * Sets the species into temp storage.
         * @param species
         */
        setAllSpecies: function(species){
            app.record.inputs.set(app.controller.record.SPECIES, species);
        },

        /**
         * Gets all species for the current recording tree-element.
         * todo: input should match warehouse input
         * @returns {*} species array
         */
        getSavedZoneSpecies: function(zone){
            var type = app.storage.tmpGet(app.controller.record.TYPE);
            var part = app.storage.tmpGet(app.controller.record.PART);
            var allSpecies = this.getAllSpecies();

            return allSpecies[type][part] ? allSpecies[type][part][zone] || [] : [];
        },

        /**
         * Gets all species for the current recording tree-element.
         * todo: input should match warehouse input.
         */
        setSavedZoneSpecies: function(zone, id, checked){
            var species = this.getSavedZoneSpecies(zone);

            //add or remove the species
            if (checked){
                //if exists ignore
                if(species.indexOf(id) == -1){
                    species.push(id);
                }
            } else {
                //remove only if exists
                var index = species.indexOf(id);
                if (index != -1){
                    species.splice(index);
                }
//            }
//
//            var type = app.storage.tmpGet(app.controller.record.TYPE);
//            var part = app.storage.tmpGet(app.controller.record.PART);
//            var elem = type + '_' + part;
//
//            var allSpecies = this.getAllSpecies();
//            if (allSpecies[elem] == null){
//                allSpecies[elem] = {};
//            }
//            allSpecies[elem][zone] = species;

            }

            var type = app.storage.tmpGet(app.controller.record.TYPE);
            var part = app.storage.tmpGet(app.controller.record.PART);

            var allSpecies = this.getAllSpecies();
            if (allSpecies[type][part] == null){
                allSpecies[type][part] = {};
            }
            allSpecies[type][part][zone] = species;


            //put back the modified species array
            this.setAllSpecies(allSpecies);
        },

        /**
         * Categorises the species list in tolerant and sensitive species arrays.
         * @param list
         */
        categorizeSpecies: function(list){
            var sensitive = [];
            var tolerant = [];

            for (var i = 0; i < list.length; i++){

                for (var j = 0; j < app.data.species.length; j++){
                    if (app.data.species[j].id == list[i]){
                        if (app.data.species[j].type == 'tolerant'){
                            tolerant.push(list[i]);
                        } else {
                            sensitive.push(list[i]);
                        }
                        break;
                    }
                }
            }

            return {
                'sensitive': sensitive,
                'tolerant': tolerant
            };
        },

        /**
         *
         */
        renderList : function(callback){
            var filters = {}; //this.getCurrentFilters();
            var sort = this.DEFAULT_SORT;
            var species = app.data.species;
            if (species != null){
                this.renderListCore(species, sort, filters, callback);
            }
        },

        /**
         *
         * @param list
         * @param sort
         * @param filters
         */
        renderListCore: function(list, sort, filters, callback){
            //todo: might need to move UI functionality to higher grounds
            $.mobile.loading("show");
            //filter list
            if(filters.length > 0){
                var filter = filters.pop();

                function onFilterSuccess (species){
                    app.controller.list.renderListCore(species, sort, filters);
                }

                list = this.filterList(list, filter, onFilterSuccess);
                return;
            }

            function onSortSuccess(){
                if (list != null){
                    app.controller.list.printList(list);
                    $.mobile.loading("hide");

                    if (callback != null){
                        callback();
                    }
                }
            }

            list = this.sortList(list, sort, onSortSuccess);
        },

        /**
         *
         * @param species
         */
        printList : function(species){
            var s = species;
            var recording = app.storage.tmpGet(app.controller.record.RECORDING);

            var template = null;
            if (recording){
                template = $('#list-record-template').html();

                //check the saved ones
                s = objClone(species);

                var zone = app.storage.tmpGet(app.controller.record.ZONE);

                var checkedSpecies = this.getSavedZoneSpecies(zone);
                for(var i = 0; i < s.length; i++){
                    if (checkedSpecies.indexOf(s[i].id) != -1){
                        s[i].checked = "checked";
                    } else {
                        s[i].checked = "";
                    }
                }

            } else {
                template = $('#list-template').html();
            }

            var placeholder = $('#list-placeholder');
            var compiled_template = Handlebars.compile(template);

            placeholder.html(compiled_template({'species': s}));
            placeholder.trigger('create');
        },

        getChecked: function(tree){
            var record = app.record.get();

        },

        /**
         *
         * @returns {*|Object|{}}
         */
        getSpecies : function(){
            return app.settings('listSpecies') || {};
        },

        setSpecies : function(species){
            return app.settings('listSpecies', species);
        },

        /**
         * Uses session storage;
         * @returns {*|{}}
         */
        CURRENT_SPECIES_KEY: 'currentSpecies',
        getCurrentSpecies: function(){
            return app.storage.tmpGet(this.CURRENT_SPECIES_KEY);
        },

        /**
         *
         * @param id
         * @returns {*}
         */
        setCurrentSpecies : function(id){
            var species = {};

            for (var i = 0; i < app.data.species.length; i++) {
                if (app.data.species[i].id == id) {
                    species = app.data.species[i];
                    break;
                }
            }
            return app.storage.tmpSet(this.CURRENT_SPECIES_KEY, species);
        },

        /**
         *
         * @returns {*|Object|Array}
         */
        getCurrentFilters : function(){
            return app.settings(this.FILTERS_KEY) || [];
        },

        /**
         *
         * @param filter
         * @returns {Array}
         */
        getFilterCurrentGroup : function(filter){
            var current_filter = this.getCurrentFilters();
            var grouped = [];
            for (var i =0; i < current_filter.length; i++){
                if (current_filter[i].group == filter.group){
                    grouped.push(current_filter[i]);
                }
            }
            return grouped;
        },

        /**
         *
         * @returns {*|Object|string}
         */
        getSortType : function(){
            return app.settings(this.SORT_KEY) || this.DEFAULT_SORT;
        },

        /**
         *
         * @param type
         * @returns {*|Object}
         */
        setSortType : function(type){
            return app.settings(this.SORT_KEY, type);
        },

        /**
         *
         * @param id
         * @returns {*}
         */
        getFilterById : function(id){
            for(var i = 0; i < this.filters.length; i++){
                if(this.filters[i].id == id){
                    return this.filters[i];
                }
            }
            return null;
        },

        /**
         *
         * @param list
         * @param sort
         * @param onSuccess
         */
        sortList: function (list, sort, onSuccess){
            switch(sort){
                case 'probability_sort':
                    app.controller.list.prob.runFilter(list, function(){
                        list.sort(app.controller.list.prob.sort);
                        onSuccess(list);
                        return;
                    });
                    break;
                case 'taxonomic':
                    list.sort(function(a, b){
                        a = a['taxon'].toLowerCase();
                        b = b['taxon'].toLowerCase();
                        if (a == b){
                            return 0;
                        }
                        return a > b ? 1 : -1;
                    });
                    break;
                case 'taxonomic_r':
                    list.sort(function(a, b){
                        a = a['taxon'].toLowerCase();
                        b = b['taxon'].toLowerCase();
                        if (a == b){
                            return 0;
                        }
                        return a < b ? 1 : -1;
                    });
                    break;
                case this.DEFAULT_SORT + '_r':
                    list.sort(function(a, b){
                        a = a['common_name'].toLowerCase();
                        b = b['common_name'].toLowerCase();
                        if (a == b){
                            return 0;
                        }
                        return a < b ? 1 : -1;
                    });
                    break;
                case this.DEFAULT_SORT:
                default:
                    list.sort(function(a, b){
                        a = a['common_name'].toLowerCase();
                        b = b['common_name'].toLowerCase();
                        if (a == b){
                            return 0;
                        }
                        return a > b ? 1 : -1;
                    });
            }
            onSuccess(list);
        },

        /**
         * Asks the user to start an appcache download
         * process.
         */
        download: function(){
            var OFFLINE = 'offline';
            var offline = app.settings(OFFLINE);

            if (offline == null || (!offline['downloaded'] && !offline['dontAsk'])){
                var donwloadBtnId = "download-button";
                var donwloadCancelBtnId = "download-cancel-button";
                var downloadCheckbox = "download-checkbox";

                //ask the user
                var message =
                    'Start downloading the app for offline use?</br>'+

                    '<label><input id="' + downloadCheckbox + '" type="checkbox" name="checkbox-0 ">Don\'t ask again'+
                    '</label> </br>'+

                    '<a href="#" id="' + donwloadBtnId + '"' +
                    'class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Download</a>' +
                    '<a href="#" id="' + donwloadCancelBtnId + '"'+
                    'class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Cancel</a>';

                app.navigation.popup(message);

                $('#' + donwloadBtnId).on('click', function(){
                    _log('list: starting appcache downloading process.');

                    //for some unknown reason on timeout the popup does not disappear
                    setTimeout(function(){
                        function onSuccess(){
                            offline = {
                                'downloaded': true,
                                'dontAsk': false
                            };
                            app.settings(OFFLINE, offline);
                            app.navigation.closePopup();
                            location.reload();
                        }

                        function onError(){
                            _log('list: ERROR appcache.');
                        }

                        startManifestDownload('appcache', 114,
                            'sites/all/modules/iform_mobile/libs/offline.php', onSuccess, onError);
                    }, 500);

                });

                $('#' + donwloadCancelBtnId).on('click', function(){
                    _log('list: appcache dowload canceled.');
                    var dontAsk = $('#' + downloadCheckbox).prop('checked');
                    offline = {
                        'downloaded': false,
                        'dontAsk': dontAsk
                    };

                    app.settings(OFFLINE, offline);
                });
            }
        }
    };

}(jQuery));

