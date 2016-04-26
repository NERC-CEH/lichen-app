(function ($) {
  window.app = window.app || {};
  app.controller = app.controller || {};
  app.controller.list = {
    DEFAULT_SORT: 'taxonomic',

    /**
     *
     */
    pagecreate: function () {
      _log('list: pagecreate.');

      $(document).on('dataLoaded', this.pagecontainershow); //async data load for the first time
    },

    /**
     *
     */
    pagecontainershow: function () {
      _log('list: pagecontainershow.');

      //set header
      var heading = "Lichen IDs";
      var recording = morel.storage.tmpGet(app.controller.record.RECORDING);
      if (recording) {
        var zone = morel.storage.tmpGet(app.controller.record.ZONE);
        var type = morel.storage.tmpGet(app.controller.record.TYPE);

        var zones = app.controller.tree_part.zones[type];
        var zoneId = null;
        for (var i = 0; i < zones.length; i++) {
          if (zones[i].zone == zone) {
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

      app.controller.list.renderList(function () {
        $('.species-list-button').each(function (index, value) {
          var id = $(this).data('speciesid');
          $(this).on('click', function () {
            app.controller.list.setCurrentSpecies(id);
          });
        });
        $('.species-list-checkbox-button').each(function (index, value) {
          var id = $(this).data('speciesid');
          $(this).on('click', function () {
            app.controller.list.setCurrentSpecies(id);
          });
        });

        //if recording assign list checkbox event listeners
        var recording = morel.storage.tmpGet(app.controller.record.RECORDING);
        if (recording) {
          $('.species-list-checkbox-button > div > input').on('change', function (index, value) {
            var zone = morel.storage.tmpGet(app.controller.record.ZONE);

            var id = $(this).data('speciesid');
            var checked = $(this).is(':checked');
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
    setNextButton: function (zones, zoneId) {
      //set next button
      var zone_next = $('#zone-next-button');

      zone_next.unbind('click'); //remove previous handlers
      //set the state update upon click
      zone_next.on('click', function () {
        //change the state of the recording: what tree and part of it we are now recording
        var zone = $(this).data('zone');
        morel.storage.tmpSet(app.controller.record.ZONE, zone);
      });

      if (++zoneId < zones.length) {
        zone_next.data('zone', zones[zoneId].zone);
        zone_next.text(zones[zoneId].title);

        //set button listener to refresh the page
        zone_next.on('click', app.controller.list.pagecontainershow); //refresh page
      } else {
        zone_next.text('Finish');

        //set button listener to refresh the page
        zone_next.on('click', function (event) {
          $.mobile.back();
        });
      }
    },

    /**
     * gets species from temp storage.
     * @returns {*|{}}
     */
    getAllSpecies: function () {
      return morel.record.inputs.get(app.controller.record.SPECIES) || {'trunk': {}, 'branch': {}};
    },

    /**
     * Sets the species into temp storage.
     * @param species
     */
    setAllSpecies: function (species) {
      morel.record.inputs.set(app.controller.record.SPECIES, species);
    },

    /**
     * Gets all species for the current recording tree-element.
     * todo: input should match warehouse input
     * @returns {*} species array
     */
    getSavedZoneSpecies: function (zone) {
      var type = morel.storage.tmpGet(app.controller.record.TYPE);
      var part = morel.storage.tmpGet(app.controller.record.PART);
      var allSpecies = this.getAllSpecies();

      return allSpecies[type][part] ? allSpecies[type][part][zone] || [] : [];
    },

    /**
     * Gets all species for the current recording tree-element.
     * todo: input should match warehouse input.
     */
    setSavedZoneSpecies: function (zone, id, checked) {
      var species = this.getSavedZoneSpecies(zone);

      //add or remove the species
      if (checked) {
        //if exists ignore
        if (species.indexOf(id) == -1) {
          species.push(id);
        }
      } else {
        //remove only if exists
        var index = species.indexOf(id);
        if (index != -1) {
          species.splice(index);
        }

      }

      var type = morel.storage.tmpGet(app.controller.record.TYPE);
      var part = morel.storage.tmpGet(app.controller.record.PART);

      var allSpecies = this.getAllSpecies();
      if (allSpecies[type][part] == null) {
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
    categorizeSpecies: function (list) {
      var sensitive = [];
      var tolerant = [];

      for (var i = 0; i < list.length; i++) {

        for (var j = 0; j < app.data.species.length; j++) {
          if (app.data.species[j].id == list[i]) {
            if (app.data.species[j].type == 'tolerant') {
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
    renderList: function (callback) {
      var sort = this.DEFAULT_SORT;
      var species = app.data.species;
      if (species != null) {
        this.renderListCore(species, sort, callback);
      }
    },

    /**
     *
     * @param list
     * @param sort
     * @param filters
     */
    renderListCore: function (list, sort, callback) {
      //sort
      var list_form_categorised = {
        'bushy': [],
        'leafy': [],
        'granular-crustose': []
      };

      for (var i = 0; i < list.length; i++) {
        list_form_categorised[list[i].growth_form].push(list[i]);
      }

      function sorter(a, b) {
        return a.taxon > b.taxon;
      }

      list_form_categorised['bushy'].sort(sorter);
      list_form_categorised['leafy'].sort(sorter);
      list_form_categorised['granular-crustose'].sort(sorter);

      var sorted_list = list_form_categorised['bushy'];
      sorted_list = sorted_list.concat(list_form_categorised['leafy']);
      sorted_list = sorted_list.concat(list_form_categorised['granular-crustose']);

      if (list != null) {
        app.controller.list.printList(sorted_list);

        if (callback != null) {
          callback();
        }
      }
    },

    /**
     *
     * @param species
     */
    printList: function (species) {
      var s = species;
      var recording = morel.storage.tmpGet(app.controller.record.RECORDING);

      var template = null;
      if (recording) {
        template = $('#list-record-template').html();

        //check the saved ones
        s = objClone(species);

        var zone = morel.storage.tmpGet(app.controller.record.ZONE);

        var checkedSpecies = this.getSavedZoneSpecies(zone);
        for (var i = 0; i < s.length; i++) {
          if (checkedSpecies.indexOf(s[i].id) != -1) {
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

    getChecked: function (tree) {
      var record = morel.record.get();

    },

    /**
     *
     * @returns {*|Object|{}}
     */
    getSpecies: function () {
      return morel.settings('listSpecies') || {};
    },

    setSpecies: function (species) {
      return morel.settings('listSpecies', species);
    },

    /**
     * Uses session storage;
     * @returns {*|{}}
     */
    CURRENT_SPECIES_KEY: 'currentSpecies',
    getCurrentSpecies: function () {
      return morel.storage.tmpGet(this.CURRENT_SPECIES_KEY);
    },

    /**
     *
     * @param id
     * @returns {*}
     */
    setCurrentSpecies: function (id) {
      var species = {};

      for (var i = 0; i < app.data.species.length; i++) {
        if (app.data.species[i].id == id) {
          species = app.data.species[i];
          break;
        }
      }
      return morel.storage.tmpSet(this.CURRENT_SPECIES_KEY, species);
    },

    /**
     *
     * @returns {*|Object|Array}
     */
    getCurrentFilters: function () {
      return morel.settings(this.FILTERS_KEY) || [];
    },

    /**
     *
     * @param filter
     * @returns {Array}
     */
    getFilterCurrentGroup: function (filter) {
      var current_filter = this.getCurrentFilters();
      var grouped = [];
      for (var i = 0; i < current_filter.length; i++) {
        if (current_filter[i].group == filter.group) {
          grouped.push(current_filter[i]);
        }
      }
      return grouped;
    },

    /**
     *
     * @returns {*|Object|string}
     */
    getSortType: function () {
      return morel.settings(this.SORT_KEY) || this.DEFAULT_SORT;
    },

    /**
     *
     * @param type
     * @returns {*|Object}
     */
    setSortType: function (type) {
      return morel.settings(this.SORT_KEY, type);
    },

    /**
     *
     * @param id
     * @returns {*}
     */
    getFilterById: function (id) {
      for (var i = 0; i < this.filters.length; i++) {
        if (this.filters[i].id == id) {
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
    sortList: function (list, sort, onSuccess) {
      switch (sort) {
        case 'probability_sort':
          app.controller.list.prob.runFilter(list, function () {
            list.sort(app.controller.list.prob.sort);
            onSuccess(list);
            return;
          });
          break;
        case 'taxonomic':
          list.sort(function (a, b) {
            a = a['taxon'].toLowerCase();
            b = b['taxon'].toLowerCase();
            if (a == b) {
              return 0;
            }
            return a > b ? 1 : -1;
          });
          break;
        case 'taxonomic_r':
          list.sort(function (a, b) {
            a = a['taxon'].toLowerCase();
            b = b['taxon'].toLowerCase();
            if (a == b) {
              return 0;
            }
            return a < b ? 1 : -1;
          });
          break;
        case this.DEFAULT_SORT + '_r':
          list.sort(function (a, b) {
            a = a['common_name'].toLowerCase();
            b = b['common_name'].toLowerCase();
            if (a == b) {
              return 0;
            }
            return a < b ? 1 : -1;
          });
          break;
        case this.DEFAULT_SORT:
        default:
          list.sort(function (a, b) {
            a = a['common_name'].toLowerCase();
            b = b['common_name'].toLowerCase();
            if (a == b) {
              return 0;
            }
            return a > b ? 1 : -1;
          });
      }
      onSuccess(list);
    }
  };

}(jQuery));

