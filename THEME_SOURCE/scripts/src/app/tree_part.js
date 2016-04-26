(function ($) {
  window.app = window.app || {};
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

    pagecreate: function () {
      _log('tree_part: pagecreate.');

    },

    pagecontainershow: function () {
      _log('tree_part: pagecontainershow.');

      //set header
      var heading = "";
      var type = morel.storage.tmpGet(app.controller.record.TYPE);
      var part = morel.storage.tmpGet(app.controller.record.PART);
      switch (type) {
        case 'trunk':
          heading = 'Trunk ';
          break;
        case 'branch':
          heading = 'Branch ';
          break;
        default:
          heading = 'ERROR';
      }
      $('#tree_part_heading').text(heading + part);

      app.controller.tree_part.setNextButton(heading, type, part);

      //render Zone buttons
      app.controller.tree_part.renderButtons(type);

      //attach listeners
      var $circumference = $('#circumference');
      $circumference.change(this.updateCircumference);

      var name = morel.record.inputs.KEYS['TREE_CIRCUM_' + part];
      var value = morel.record.inputs.get(name);
      $circumference.val(value);
    },

    updateCircumference: function () {
      var part = morel.storage.tmpGet(app.controller.record.PART);
      var value = $('#circumference').val();
      var name = morel.record.inputs.KEYS['TREE_CIRCUM_' + part];

      if (value){
        morel.record.inputs.set(name, value);
      } else {
        morel.record.inputs.remove(name);
      }
    },

    /**
     * Sets the next part button.
     * @param heading
     * @param type
     * @param part
     */
    setNextButton: function (heading, type, part) {
      //set next button
      var tree_part_next = $('#tree-part-next-button');

      tree_part_next.unbind('click'); //remove previous handlers
      //set the state update upon click
      tree_part_next.on('click', function () {
        //sometimes the onChange is not fired on circumference field change
        //so we need to manually check if it was changed and save on leave
        app.controller.tree_part.updateCircumference();

        //change the state of the recording: what tree and part of it we are now recording
        var type = $(this).data('type');
        var part = $(this).data('part');

        morel.storage.tmpSet(app.controller.record.TYPE, type);
        morel.storage.tmpSet(app.controller.record.PART, part);
      });

      if (part++ < app.controller.record.types[type].length) {
        tree_part_next.data('type', type);
        tree_part_next.data('part', part);
        tree_part_next.text(heading + part);

        //set button listener to refresh the page
        tree_part_next.on('click', app.controller.tree_part.pagecontainershow); //refresh page
      } else {
        tree_part_next.text('Finish');

        //set button listener to refresh the page
        tree_part_next.on('click', function (event) {
          $.mobile.back();
        });
      }
    },

    /**
     * Renders the UI (buttons)
     */
    renderButtons: function (type) {
      var template = $('#part-template').html();

      var template_data = {
        'zone': this.zones[type]
      };

      template_data['trunk'] = morel.storage.tmpGet(app.controller.record.TYPE) == 'trunk';

      var placeholder = $('#part-placeholder');
      var compiled_template = Handlebars.compile(template);

      app.controller.tree_part.addSelectedSpecies(template_data);

      placeholder.html(compiled_template(template_data));
      placeholder.trigger('create');

      //button listeners
      $('a.zone').on('click', function () {
        //sometimes the onChange is not fired on circumference field change
        //so we need to manually check if it was changed and save on leave
        app.controller.tree_part.updateCircumference();

        //change the state of the recording: what tree and part of it we are now recording
        var zone = $(this).data('zone');
        morel.storage.tmpSet(app.controller.record.ZONE, zone);
      });
    },

    /**
     * Prepares the selected species data for the buttons template.
     *
     * @param part
     * @returns {{}}
     */
    addSelectedSpecies: function (template_data) {

      function core(zone) {
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

      for (var i = 0; i < template_data.zone.length; i++) {
        core(template_data.zone[i]);
      }
    }

  };

}(jQuery));