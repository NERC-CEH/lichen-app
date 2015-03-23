(function ($) {
  window.app = window.app || {};
  app.controller = app.controller || {};
  app.controller.record = {
    RECORDING: 'recording',
    SPECIES: 'species',
    TYPE: 'recording_type',
    PART: 'recording_part',
    ZONE: 'recording_zone',

    CONF: {
      USER_EMAIL_STORAGE_KEY: 'userEmail'
    },

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
    pagecreate: function () {
      _log('record: pagecreate.');

      this.saveDate();

      //attach element listeners
      this.$resultsButton = $('#results-button');
      this.$resultsButton.on('click', this.proceedToResults);

      this.$treeTypeInputs = $('input[name=tree-type]');
      this.$treeTypeInputs.on('change', function(){
        if($(this).is(':checked')) {
          // code here
          var value = $(this).val();
          morel.record.inputs.set(
            morel.record.inputs.KEYS.TREE_TYPE,
            app.CONF.WAREHOUSE_VALUES.treeType[value]);
        }
      });

      this.$emailInput = $('input[name=email]');
    },

    proceedToResults: function () {
      //update email
      var email = $('input[name=email]').val();
      if (email){
        morel.settings(app.controller.record.CONF.USER_EMAIL_STORAGE_KEY, email);
        morel.record.inputs.set(morel.record.inputs.KEYS.EMAIL, email);
      } else {
        morel.settings(app.controller.record.CONF.USER_EMAIL_STORAGE_KEY, ' ');
        morel.record.inputs.remove(morel.record.inputs.KEYS.EMAIL);
      }

      //update tree circumferences


      var valid = app.controller.record.valid();
      if (valid) {
        $("body").pagecontainer("change", "#results");
      }

    },

    pagecontainershow: function (e, data) {
      _log('record: pagecontainershow.');

      var prevPageId = data.prevPage[0].id;
      switch (prevPageId) {
        case 'welcome':
          //prepare a new record
          this.clear();
          break;
        default:
      }

      this.renderButtons();
    },

    /**
     * Renders the UI (buttons)
     */
    renderButtons: function () {
      var template = $('#type-template').html();

      //branches
      var template_data = this.types.branch;

      var placeholder = $('#branch-placeholder');
      var compiled_template = Handlebars.compile(template);

      placeholder.html(compiled_template(template_data));
      placeholder.trigger('create');

      //trunks
      template_data = this.types.trunk;

      placeholder = $('#trunk-placeholder');
      compiled_template = Handlebars.compile(template);

      placeholder.html(compiled_template(template_data));
      placeholder.trigger('create');

      //attach button listeners
      $('.record-button').on('click', function () {
        //change the state of the recording: what tree and part of it we are now recording
        var type = $(this).data('type');
        var part = $(this).data('part');

        morel.storage.tmpSet(app.controller.record.TYPE, type);
        morel.storage.tmpSet(app.controller.record.PART, part);
      });

      //light up results
      this.setResultsOnButtons(this.types.branch);
      this.setResultsOnButtons(this.types.trunk);

    },

    /**
     * Sets up the results as circles to be shown on the buttons.
     */
    setResultsOnButtons: function (data) {
      var species = app.controller.list.getAllSpecies();

      //go through every part of the type
      for (var tree_part = 0; tree_part < data.length; tree_part++) {
        var type = data[tree_part].type;
        var speciesOfType = species[type];
        var part = speciesOfType[data[tree_part].part];

        if (part != null) {
          var keys = Object.keys(part);
          var modified = 0;

          //count how many have entries
          for (var speciesSelected = 0; speciesSelected < keys.length; speciesSelected++) {
            if (part[keys[speciesSelected]].length > 0) {
              modified++;
            }
          }

          var button = $('a[data-type="' + type + '"][data-part="' + (tree_part + 1) + '"]');
          switch (modified) {
            case 1:
              button.find('.first-progress').addClass('progress');
              button.find('.half-progress').removeClass('progress');
              button.find('.full-progress').removeClass('progress');
              break;
            case 2:
              button.find('.first-progress').addClass('progress');
              button.find('.half-progress').addClass('progress');
              button.find('.full-progress').removeClass('progress');
              break;
            case 3:
              button.find('.first-progress').addClass('progress');
              button.find('.half-progress').addClass('progress');
              button.find('.full-progress').addClass('progress');
              break;
            default:
              //no modified ones
              if (modified > 3) {
                _log('record: Too many modified ones.', log.ERROR);
              }
              button.find('.first-progress').removeClass('progress');
              button.find('.half-progress').removeClass('progress');
              button.find('.full-progress').removeClass('progress');
          }

        }
      }
    },

    /**
     * Clears the recording page from existing inputs.
     */
    clear: function () {
      _log('record: clearing recording page.');
      morel.record.clear();

      //if exists append previous email
      var email = morel.settings(this.CONF.USER_EMAIL_STORAGE_KEY);
      if (email){
        this.$emailInput.val(email);
      }

      //add date
      this.saveDate();

      //save tree type to default
      morel.record.inputs.set(
        morel.record.inputs.KEYS.TREE_TYPE,
        app.CONF.WAREHOUSE_VALUES.treeType['birch']
      );
    },


    /**
     * Validates the record and GPS lock. If not valid then
     * takes some action - popup/gps page redirect.
     * @returns {*}
     */
    valid: function () {
      //validate record
      var invalids = this.validateInputs();
      if (invalids.length > 0) {
        var message =
          "<h3>Still missing:</h3><ul>";

        for (var i = 0; i < invalids.length; i++) {
          message += "<li>" + invalids[i].name + "</li>";
        }

        message += "</ul>";
        //app.navigation.popup(message, true);
        app.message(message);
        return false;
      }
      return true;
    },

    /**
     * Validates the record inputs.
     */
    validateInputs: function () {
      var invalids = [];
      //core inputs
      if (!morel.record.inputs.is(morel.record.inputs.KEYS.DATE)) {
        invalids.push({
          'id': morel.record.inputs.KEYS.DATE,
          'name': 'General: Date'
        });
      }
      if (!morel.record.inputs.is(morel.record.inputs.KEYS.SREF)) {
        invalids.push({
          'id': morel.record.inputs.KEYS.SREF,
          'name': 'General: Location'
        });
      }
      if (morel.record.inputs.is(morel.record.inputs.KEYS.EMAIL)) {
        var email = morel.record.inputs.get(morel.record.inputs.KEYS.EMAIL);
        if (!validateEmail(email)){
          invalids.push({
            'id': morel.record.inputs.KEYS.EMAIL,
            'name': 'General: Email Invalid'
          });
        }
      }

      //NAQI data
      //species
      var species = morel.record.inputs.get('species');
      if (!species) {
        invalids.push({
          'name': 'Lichen Species'
        });
        return invalids;
      }

      //circum
      var trunks = species['trunk'];
      var trunkIDs = Object.keys(trunks);
      for (var i = 0; i < trunkIDs.length; i++) {
        var part = trunkIDs[i];
        var name = morel.record.inputs.KEYS['TREE_CIRCUM_' + part];
        var value = morel.record.inputs.get(name);
        if (!value) {
          invalids.push({
            'name': 'Trunk ' + part + ' Circumference'
          });
        }
      }

      return invalids;
    },

    saveSref: function (location) {
      if (location == null) {
        return false;
      }
      var sref = location.lat + ', ' + location.lon;
      var sref_system = "4326";
      var sref_accuracy = location.acc;
      morel.record.inputs.set(morel.record.inputs.KEYS.SREF, sref);
      morel.record.inputs.set(morel.record.inputs.KEYS.SREF_SYSTEM, sref_system);
      morel.record.inputs.set(morel.record.inputs.KEYS.SREF_ACCURACY, sref_accuracy);
      morel.record.inputs.set(morel.record.inputs.KEYS.SREF_NAME, location.name);
    },

    /**
     * Saves the user comment into current record.
     */
    saveInput: function (name) {
      if (name == null && name == "") {
        _log('record: ERROR, no input name provided.');
        return false;
      }
      var ele = document.getElementById(name);
      var value = $(ele).val();
      if (value != "") {
        morel.record.inputs.set(name, value);
      }
    },

    /**
     * Saves the selected species into current record.
     */
    saveSpecies: function () {
      var specie = app.controller.list.getCurrentSpecies();
      if (specie != null && specie.warehouse_id != null && specie.warehouse_id != "") {
        var name = 'occurrence:taxa_taxon_list_id';
        var value = specie.warehouse_id;
        morel.record.inputs.set(name, value);

        //add header to the page
        $('#record_heading').text(specie.common_name);
      } else {
        _log('record: ERROR no species was found. Nothing attached to the recording.');
      }
    },

    /**
     * Saves the current date and populates the date input.
     */
    saveDate: function () {
      var now = new Date();
      var day = ("0" + now.getDate()).slice(-2);
      var month = ("0" + (now.getMonth() + 1)).slice(-2);

      var value = now.getFullYear() + "-" + (month) + "-" + (day);
      var name = 'sample:date';

      var ele = document.getElementById(name);
      $(ele).val(value);

      morel.record.inputs.set(name, value);
    },

    gpsButtonState: function (state) {
      var button = $('#sref-top-button');
      switch (state) {
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