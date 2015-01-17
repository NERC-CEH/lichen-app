/*!
 * Lichen App Controllers. 
 * Version: 0.0.2
 *
 * http://www.indicia.org.uk/
 *
 * Author 2015 Karolis Kazlauskis
 * Released under the GNU GPL v3 license.
 */

/**
 * Created by karkaz on 20/08/14.
 */
(function ($) {
  app.controller = app.controller || {};
  app.controller.about = {

    pagecontainershow: function () {
      var template = $('#app-version-template').html();
      var placeholder = $('#app-version-placeholder');

      var compiled_template = Handlebars.compile(template);

      placeholder.html(compiled_template({'version': app.CONF.VERSION}));
      placeholder.trigger('create');
    }

  };

}(jQuery));

/*!
 * App wide logic.
 */

(function($){
    checkForUpdates();
    app.initialise();

    //Fixing back buttons for Mac 7.* History bug.
    $(document).on('pagecreate', function(event, ui) {
        if (browserDetect('Safari')){
            if (jQuery.mobile.activePage != null) {
                var nextPageid = event.target.id;
                var currentPageURL = null;

                var external = jQuery.mobile.activePage.attr('data-external-page');
                if (external == null) {
                    currentPageURL = '#' + jQuery.mobile.activePage.attr('id');
                }

                fixPageBackButtons(currentPageURL, nextPageid);
            }
        }
    });

    /**
     * Overriding the default iform mobile library function responsible
     * for extracting and compiling saved records into a FormData object for posting.
     *
     * In the app we are saving the records species[TREE][PART], and this should be
     * translated to warehouse inputs
     *      'sc:species-X::present = WAREHOUSE_SPECIES_ID'
     *                '..::occAttrTREE = TREE NUMBER'
     *                '..::occAttrPART = TREE PART NUMBER'
     *
     * Returns a specific saved record in FormData format.
     * @param recordKey
     * @returns {FormData}
     */
    app.record.db.getData =  function(recordKey, callback, onError){
        function onSuccess(savedRecord) {
            var data = new FormData();

            for (var k = 0; k < savedRecord.length; k++) {
                if (savedRecord[k].type == "file") {
                    var file = savedRecord[k].value;
                    var type = file.split(";")[0].split(":")[1];
                    var extension = type.split("/")[1];
                    data.append(savedRecord[k].name, dataURItoBlob(file, type), "pic." + extension);
                } else {
                    var name = savedRecord[k].name;
                    var value = savedRecord[k].value;
                    data.append(name, value);
                }
            }
            callback(data);
        }

        //Extract data from database
        var savedRecord = this.get(recordKey, onSuccess, onError);
    };

}(app.$ || jQuery));

/**
 * Updates the app's data if the source code version mismatches the
 * stored data's version.
 */
function checkForUpdates(){
    var CONTROLLER_VERSION_KEY = 'controllerVersion';
    var controllerVersion = app.settings(CONTROLLER_VERSION_KEY);
    //set for the first time
    if (controllerVersion == null){
        app.settings(CONTROLLER_VERSION_KEY, app.CONF.VERSION);
        return;
    }

    if (controllerVersion != app.CONF.VERSION){
        _log('app: controller version differs. Updating the app.', app.LOG_INFO);

        //TODO: add try catch for any problems
        app.storage.remove('species');
        app.storage.tmpClear();

        //set new version
        app.settings(CONTROLLER_VERSION_KEY, app.CONF.VERSION);
    }
}

/**
 * Created by karkaz on 20/08/14.
 */
(function ($) {
  app.controller = app.controller || {};
  app.controller.compass = {
    lastUpdate: 0,
    UPDATE_TIME_DIFF: 10, //ms

    pagecreate: function () {
      _log('compass: pagecreate', app.LOG_DEBUG);
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function (event) {
          var date = new Date();
          var now = date.getTime();
          var nextRotTime = app.controller.compass.lastUpdate + app.controller.compass.UPDATE_TIME_DIFF;

          if (nextRotTime < now) {
            app.controller.compass.lastUpdate = now;
            app.controller.compass.rotateRose(event);
          }
        });
      }
    },

    rotateRose: function (event) {
      var compass = document.getElementById('windrose');
      var alpha, webkitAlpha;

      //Check for iOS property
      if (event.webkitCompassHeading) {
        alpha = event.webkitCompassHeading;
        //Rotation is reversed for iOS
        compass.style.WebkitTransform = 'rotate(-' + alpha + 'deg)';
      } else {
        //non iOS
        alpha = event.alpha;
        webkitAlpha = alpha;
        if (!window.chrome) {
          //Assume Android stock (this is crude, but good enough for our example) and apply offset
          webkitAlpha = alpha - 270;
        }
      }

      _log('compass: rotate ' + alpha, app.LOG_DEBUG);

      //Rotate the rose
      compass.style.Transform = 'rotate(' + alpha + 'deg)';

      if (webkitAlpha != null) {
        compass.style.WebkitTransform = 'rotate(' + webkitAlpha + 'deg)';
      }

      //Rotation is reversed for FF
      compass.style.MozTransform = 'rotate(-' + alpha + 'deg)';
    }
  };

}(jQuery));

(function ($) {
  app.controller = app.controller || {};
  app.controller.list = {
    //controller configuration should be set up in an app config file
    CONF: {
      PROB_DATA_SRC: "",
      SPECIES_DATA_SRC: ""
    },

    DEFAULT_SORT: 'taxonomic',

    /**
     *
     */
    pagecreate: function () {
      _log('list: pagecreate.');

      this.loadSpeciesData();

      //ask user to appcache
      //setTimeout(app.controller.list.download, 1000);
    },

    /**
     *
     */
    pagecontainershow: function () {
      _log('list: pagecontainershow.');

      //set header
      var heading = "Lichen IDs";
      var recording = app.storage.tmpGet(app.controller.record.RECORDING);
      if (recording) {
        var zone = app.storage.tmpGet(app.controller.record.ZONE);
        var type = app.storage.tmpGet(app.controller.record.TYPE);

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
        var recording = app.storage.tmpGet(app.controller.record.RECORDING);
        if (recording) {
          $('.species-list-checkbox-button > div > input').on('change', function (index, value) {
            var zone = app.storage.tmpGet(app.controller.record.ZONE);

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
        zone_next.on('click', function (event) {
          history.back();
        });
      }
    },

    /**
     * Loads the species data to app.data.species.
     */
    loadSpeciesData: function () {
      //load species data
      if (!app.storage.is('species')) {
        app.navigation.message('Loading IDs data for the first time..');
        $.ajax({
          url: this.CONF.SPECIES_DATA_SRC,
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
    getAllSpecies: function () {
      return app.record.inputs.get(app.controller.record.SPECIES) || {'trunk': {}, 'branch': {}};
    },

    /**
     * Sets the species into temp storage.
     * @param species
     */
    setAllSpecies: function (species) {
      app.record.inputs.set(app.controller.record.SPECIES, species);
    },

    /**
     * Gets all species for the current recording tree-element.
     * todo: input should match warehouse input
     * @returns {*} species array
     */
    getSavedZoneSpecies: function (zone) {
      var type = app.storage.tmpGet(app.controller.record.TYPE);
      var part = app.storage.tmpGet(app.controller.record.PART);
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

      var type = app.storage.tmpGet(app.controller.record.TYPE);
      var part = app.storage.tmpGet(app.controller.record.PART);

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
        'granular': []
      };

      for (var i = 0; i < list.length; i++) {
        list_form_categorised[list[i].growth_form].push(list[i]);
      }

      function sorter(a, b) {
        return a.taxon > b.taxon;
      }

      list_form_categorised['bushy'].sort(sorter);
      list_form_categorised['leafy'].sort(sorter);
      list_form_categorised['granular'].sort(sorter);

      var sorted_list = list_form_categorised['bushy'];
      sorted_list = sorted_list.concat(list_form_categorised['leafy']);
      sorted_list = sorted_list.concat(list_form_categorised['granular']);

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
      var recording = app.storage.tmpGet(app.controller.record.RECORDING);

      var template = null;
      if (recording) {
        template = $('#list-record-template').html();

        //check the saved ones
        s = objClone(species);

        var zone = app.storage.tmpGet(app.controller.record.ZONE);

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
      var record = app.record.get();

    },

    /**
     *
     * @returns {*|Object|{}}
     */
    getSpecies: function () {
      return app.settings('listSpecies') || {};
    },

    setSpecies: function (species) {
      return app.settings('listSpecies', species);
    },

    /**
     * Uses session storage;
     * @returns {*|{}}
     */
    CURRENT_SPECIES_KEY: 'currentSpecies',
    getCurrentSpecies: function () {
      return app.storage.tmpGet(this.CURRENT_SPECIES_KEY);
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
      return app.storage.tmpSet(this.CURRENT_SPECIES_KEY, species);
    },

    /**
     *
     * @returns {*|Object|Array}
     */
    getCurrentFilters: function () {
      return app.settings(this.FILTERS_KEY) || [];
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
      return app.settings(this.SORT_KEY) || this.DEFAULT_SORT;
    },

    /**
     *
     * @param type
     * @returns {*|Object}
     */
    setSortType: function (type) {
      return app.settings(this.SORT_KEY, type);
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
    },

    /**
     * Asks the user to start an appcache download
     * process.
     */
    download: function () {
      var OFFLINE = 'offline';
      var offline = app.settings(OFFLINE);

      if (offline == null || (!offline['downloaded'] && !offline['dontAsk'])) {
        var donwloadBtnId = "download-button";
        var donwloadCancelBtnId = "download-cancel-button";
        var downloadCheckbox = "download-checkbox";

        //ask the user
        var message =
          'Start downloading the app for offline use?</br>' +

          '<label><input id="' + downloadCheckbox + '" type="checkbox" name="checkbox-0 ">Don\'t ask again' +
          '</label> </br>' +

          '<a href="#" id="' + donwloadBtnId + '"' +
          'class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Download</a>' +
          '<a href="#" id="' + donwloadCancelBtnId + '"' +
          'class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Cancel</a>';

        app.navigation.popup(message);

        $('#' + donwloadBtnId).on('click', function () {
          _log('list: starting appcache downloading process.');

          //for some unknown reason on timeout the popup does not disappear
          setTimeout(function () {
            function onSuccess() {
              offline = {
                'downloaded': true,
                'dontAsk': false
              };
              app.settings(OFFLINE, offline);
              app.navigation.closePopup();
              location.reload();
            }

            function onError() {
              _log('list: ERROR appcache.');
            }

            startManifestDownload('appcache', 114,
              app.CONF.APPCACHE_LOADER_URL, onSuccess, onError);
          }, 500);

        });

        $('#' + donwloadCancelBtnId).on('click', function () {
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



(function ($) {
  app.controller = app.controller || {};
  app.controller.login = {
    //controller configuration should be set up in an app config file
    CONF: {
      URL: "",
      TIMEOUT: 20000
    },

    pagecontainershow: function () {

    },

    /**
     * Starts an app sign in to the Drupal site process.
     * The sign in endpoint is specified by LOGIN_URL -
     * should be a Drupal sight using iForm Mobile Auth Module.
     *
     * It is important that the app authorises itself providing
     * appname and appsecret for the mentioned module.
     */
    login: function () {
      //todo: add validation

      _log('login: start.');
      var form = jQuery('#login-form');
      var person = {
        //user logins
        'email': form.find('input[name=email]').val(),
        'password': form.find('input[name=password]').val(),

        //app logins
        'appname': app.auth.CONF.APPNAME,
        'appsecret': app.auth.CONF.APPSECRET
      };

      $.ajax({
        url: this.CONF.URL,
        type: 'POST',
        data: person,
        callback_data: person,
        dataType: 'text',
        timeout: this.CONF.TIMEOUT,
        success: this.onLoginSuccess,
        error: this.onLoginError,
        beforeSend: this.onLogin
      });
    },

    onLogin: function () {
      $.mobile.loading('show');
    },

    onLoginSuccess: function (data) {
      _log('login: success.');

      var lines = (data && data.split(/\r\n|\r|\n/g));
      if (lines && lines.length >= 3 && lines[0].length > 0) {
        var user = {
          'secret': lines[0],
          'name': lines[1] + " " + lines[2],
          'email': this.callback_data.email
        }
      }

      $.mobile.loading('hide');
      app.controller.login.setLogin(user);

      $.mobile.changePage('#user');
      //history does not work in iOS 7.*
      //history.back();
    },

    onLoginError: function (xhr, ajaxOptions, thrownError) {
      _log("login: ERROR " + xhr.status + " " + thrownError + ".");
      _log(xhr.responseText);
      $.mobile.loading('show', {
        text: "Wrong email or password." +
        " Please double-check and try again.",
        theme: "b",
        textVisible: true,
        textonly: true
      });
      setTimeout(function () {
        $.mobile.loading('hide');
      }, 3000);
    },

    /**
     * Logs the user out of the system.
     */
    logout: function () {
      app.auth.removeUser();
    },

    /**
     * Sets the app login state of the user account.
     *
     * Saves the user account details into storage for permanent availability.
     * @param user User object or empty object
     */
    setLogin: function (user) {
      if (!$.isEmptyObject(user)) {
        _log('login: logged in.');
        app.auth.setUser(user);
      } else {
        _log('login: logged out.');
        app.auth.removeUser();
      }
    },

    /**
     * Brings the state of the user being logged in.
     * @returns boolean true if the user is logged in, or false if not
     */
    getLoginState: function () {
      return app.auth.isUser();
    }
  };

}(jQuery));

(function ($) {
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
    pagecreate: function () {
      _log('record: pagecreate.');

      this.saveDate();

      app.controller.list.loadSpeciesData();

      //attach button listeners
      $('#results-button').on('click', function () {
        var valid = app.controller.record.valid();
        if (valid == app.TRUE) {
          $("body").pagecontainer("change", "#results");
        }
      });
    },

    pagecontainershow: function (e, data) {
      _log('record: pagecontainershow.');

      var prevPageId = data.prevPage[0].id;
      switch (prevPageId) {
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

        app.storage.tmpSet(app.controller.record.TYPE, type);
        app.storage.tmpSet(app.controller.record.PART, part);
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
                _log('record: Too many modified ones.', app.LOG_ERROR);
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
      app.record.clear();
      this.saveDate();
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
          "<p>The following is still missing:</p><ul>";

        for (var i = 0; i < invalids.length; i++) {
          message += "<li>" + invalids[i].name + "</li>";
        }

        message += "</ul>";
        //app.navigation.popup(message, true);
        app.navigation.message(message);
        return app.FALSE;
      }

      //validate gps
      var gps = app.geoloc.valid();
      if (gps == app.ERROR || gps == app.FALSE) {
        //redirect to gps page
        $('body').pagecontainer("change", "#sref");
        return app.FALSE;
      }
      return app.TRUE;
    },

    /**
     * Validates the record inputs.
     */
    validateInputs: function () {
      var invalids = [];
      //core inputs
      if (!app.record.inputs.is('sample:date')) {
        invalids.push({
          'id': 'sample:date',
          'name': 'Date'
        })
      }
      if (!app.record.inputs.is('sample:entered_sref')) {
        invalids.push({
          'id': 'sample:entered_sref',
          'name': 'Location'
        })
      }
      //NAQI data

      return invalids;
    },

    saveSref: function (location) {
      if (location == null) {
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
    saveInput: function (name) {
      if (name == null && name == "") {
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
    saveSpecies: function () {
      var specie = app.controller.list.getCurrentSpecies();
      if (specie != null && specie.warehouse_id != null && specie.warehouse_id != "") {
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
    saveDate: function () {
      var now = new Date();
      var day = ("0" + now.getDate()).slice(-2);
      var month = ("0" + (now.getMonth() + 1)).slice(-2);

      var value = now.getFullYear() + "-" + (month) + "-" + (day);
      var name = 'sample:date';

      var ele = document.getElementById(name);
      $(ele).val(value);

      app.record.inputs.set(name, value);
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

(function ($) {
  app.controller = app.controller || {};
  app.controller.register = {
    //controller configuration should be set up in an app config file
    CONF: {
      URL: "",
      TIMEOUT: 20000
    },

    pagecontainershow: function () {
      //enable 'Create account' button on Terms agreement
      $('#terms-agreement').click(function () {
        var button = $('#register-button');
        if ($(this).prop('checked')) {
          button.prop('disabled', false);
        } else {
          button.prop('disabled', true);
        }
      });
    },

    /**
     * Starts an app user registration.
     *
     * The registration endpoint is specified by LOGIN_URL -
     * should be a Drupal sight using iForm Mobile Auth Module.
     *
     * It is important that the app authorises itself providing
     * appname and appsecret for the mentioned module.
     */
    register: function () {
      _log('register: start.');

      //user logins
      var form = document.getElementById('register-form');
      var data = new FormData(form);

      //app logins
      data.append('appname', app.auth.CONF.APPNAME);
      data.append('appsecret', app.auth.CONF.APPSECRET);

      $.ajax({
        url: this.CONF.URL,
        type: 'POST',
        data: data,
        dataType: 'text',
        contentType: false,
        processData: false,
        timeout: this.CONF.TIMEOUT,
        success: this.onLoginSuccess,
        error: this.onLoginError,
        beforeSend: this.onLogin
      });
    },

    onLogin: function () {
      $.mobile.loading('show');
    },

    onLoginSuccess: function (data) {
      _log('register: success.');
      $.mobile.loading('hide');
    },

    onLoginError: function (xhr, ajaxOptions, thrownError) {
      _log("register: ERROR " + xhr.status + " " + thrownError);
      _log(xhr.responseText);
      $.mobile.loading('hide');
    }

  };

}(jQuery));

(function ($) {
  app.controller = app.controller || {};
  app.controller.results = {

    y: null,
    x: null,

    trunk_path: null,
    branch_path: null,

    trunk_result: null,
    branch_result: null,

    pagecreate: function () {
      _log('results: pagecreate', app.LOG_DEBUG);

      //attach button listeners
      $('#send-button').on('click', app.controller.results.send);
      $('#save-button').on('click', app.controller.results.save);
    },

    pagecontainershow: function () {
      _log('results: pagecontaintershow', app.LOG_DEBUG);
      // draw the graph
      this.drawgraph();

      //compile results
      var species = app.controller.list.getAllSpecies();
      //lis
      var trunk_lis = this.calculateLIS(species['trunk']);
      var branch_lis = this.calculateLIS(species['branch']);
      //naqi
      var trunk_naqi = (3.6666666 - trunk_lis) / 3.33333;
      var branch_naqi = (3.4 - branch_lis) / 4;

      _log('results: trunk_lis: ' + trunk_lis + ', branch_lis: ' + branch_lis);

      $('#results-branch-lis').text(branch_lis.toFixed(1));
      $('#results-trunk-lis').text(trunk_lis.toFixed(1));
      $('#results-branch-naqi').text(branch_naqi.toFixed(1));
      $('#results-trunk-naqi').text(trunk_naqi.toFixed(1));

      //add results to the graph
      this.add_trunk_results(trunk_lis);
      this.add_branch_results(branch_lis);
    },

    /**
     * Calculates the Lichen Indicator Index.
     */
    calculateLIS: function (type) {
      var tolerant = 0;
      var sensitive = 0;

      var parts = Object.keys(type);
      for (var i = 0; i < parts.length; i++) {
        var zones = Object.keys(type[parts[i]]);
        for (var j = 0; j < zones.length; j++) {
          var species = type[parts[i]][zones[j]];
          if (has('tolerant', species)) {
            tolerant++;
          }
          if (has('sensitive', species)) {
            sensitive++;
          }
        }
      }

      function has(lichen_type, species) {
        if (species == null) {
          return false;
        }
        var species_categorized = app.controller.list.categorizeSpecies(species);

        if (lichen_type == 'sensitive') {
          return species_categorized['sensitive'].length > 0;
        } else if (lichen_type == 'tolerant') {
          return species_categorized['tolerant'].length > 0;
        } else {
          _log('results: no such lichen type.', app.LOG_ERROR);
        }
      }

      return (sensitive - tolerant) / parts.length;
    },

    /*
     * Validates and sends the record. Saves it if no network.
     */
    send: function () {
      $.mobile.loading('show');

      function onError(err) {
        $.mobile.loading('hide');
        var message = "<center><h3>Sorry!</h3></center>" +
          "<p>" + err.message + "</p>";
        app.navigation.message(message);
      }

      if (navigator.onLine) {
        //online
        function onOnlineSuccess() {
          $.mobile.loading('hide');
          app.navigation.message("<center><h2>Submitted successfully. " +
          "</br>Thank You!</h2></center>");

          //clean the old record
          app.controller.record.clear();

          setTimeout(function () {
            $("body").pagecontainer("change", "#welcome");
          }, 3000);
        }

        app.controller.results.processOnline(onOnlineSuccess, onError);
      } else {
        //offline
        function onSaveSuccess() {
          $.mobile.loading('hide');
          app.navigation.message("<center><h2>No Internet. Record saved.</h2></center>");
          setTimeout(function () {
            $("body").pagecontainer("change", "#welcome");
          }, 3000);
        }

        app.controller.results.processOffline(onSaveSuccess, onError)
      }
    },

    /*
     * Validates and saves the record.
     */
    save: function () {
      $.mobile.loading('show');

      function onSuccess() {
        $.mobile.loading('hide');
        app.navigation.message("<center><h2>Record saved.</h2></center>");

        //clean the old record
        app.controller.record.clear();

        setTimeout(function () {
          $("body").pagecontainer("change", "#welcome");
        }, 3000);
      }

      function onError(err) {
        $.mobile.loading('hide');
        var message = "<center><h3>Sorry!</h3></center>" +
          "<p>" + err.message + "</p>";
        //xhr.status+ " " + thrownError + "</p><p>" + xhr.responseText +
        app.navigation.message(message)
        $("body").pagecontainer("change", "#welcome");
      }

      app.controller.results.processOffline(onSuccess, onError);
    },

    /**
     * Saves and submits the record.
     */
    processOnline: function (callback, onError) {
      _log("record: process online.");
      var onSaveSuccess = function (savedRecordId) {
        app.record.clear();

        function onSendSuccess() {
          app.record.db.remove(savedRecordId);
          if (callback != null) {
            callback();
          }
        }

        //#2 Post the record
        app.io.sendSavedRecord(savedRecordId, onSendSuccess, onError);
      };
      //#1 Save the record first
      app.record.db.save(onSaveSuccess, onError);
    },

    /**
     * Saves the record.
     */
    processOffline: function (callback, onError) {
      _log("record: process offline");
      var onSaveSuccess = function (savedRecordId) {
        app.record.clear();

        if (callback != null) {
          callback();
        }
      };
      app.record.db.save(onSaveSuccess, onError);
    },

    drawgraph: function () {
      var container = $('#graph-container');

      // define dimensions of graph
      var m = [40, 10, 80, 20]; // margins
      var w = container.width() - m[1] - m[3]; // width
      var h = container.height() - m[0] - m[2]; // height

      var data = [3.6, 0.3, -3];
      var data2 = [3.4, -0.4, -4.6];

      //scales
      var formatxAxis = d3.format('.0f');

      this.x = d3.scale.linear().domain([0, 2]).range([0, w]);
      this.y = d3.scale.linear().domain([-3, 4]).range([h, 0]);

      // create a line function that can convert data[] into x and y points
      var line = d3.svg.line()
        // assign the X function to plot our line as we wish
        .x(function (d, i) {
          // return the X coordinate where we want to plot this datapoint
          return app.controller.results.x(i);
        })
        .y(function (d) {
          // return the Y coordinate where we want to plot this datapoint
          return app.controller.results.y(d);
        });

      // Add an SVG element with the desired dimensions and margin.
      var graph = d3.select("#graph-container").append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

      var gradient = graph.append("svg:defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("spreadMethod", "pad");

      gradient.append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", "lightgreen")
        .attr("stop-opacity", 1);

      gradient.append("svg:stop")
        .attr("offset", "30%")
        .attr("stop-color", "lightgrey")
        .attr("stop-opacity", 1);

      gradient.append("svg:stop")
        .attr("offset", "50%")
        .attr("stop-color", "#FFFF66")
        .attr("stop-opacity", 1);

      gradient.append("svg:stop")
        .attr("offset", "70%")
        .attr("stop-color", "#FF6666")
        .attr("stop-opacity", 1);

      graph.append("svg:rect")
        .attr("width", w)
        .attr("height", h)
        .style("fill", "url(#gradient)");

      // create axis
      var xAxis = d3.svg.axis().scale(this.x).tickValues([0.1, 0.5, 1.0, 1.5, 2.0]);
      graph.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis);
      var yAxisLeft = d3.svg.axis().scale(this.y).ticks(4).tickSize(-w).orient("left");
      graph.append("svg:g")
        .style("stroke-dasharray", ("1, 1"))
        .attr("class", "y axis")
        .call(yAxisLeft);

      //axis labels
      graph.append("text")
        .attr("y", -m[0] * 0.7)
        .attr("x", 0)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("(LIS)");

      graph.append("text")
        .attr("y", h + m[3])
        .attr("x", w - m[0])
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("(NAQI)");

      // Add the clip path.
      graph.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", w)
        .attr("height", h);

      //add lines
      //trunk:
      this.trunk_path = graph.append("svg:path")
        .attr('class', 'trunk')
        .attr("d", line(data)).attr('clip-path', 'url(#clip)');

      //branch:
      this.branch_path = graph.append("svg:path")
        .attr('class', 'branch')
        .style("stroke-dasharray", ("5, 5, 5, 9, 9"))

        .attr("d", line(data2)).attr('clip-path', 'url(#clip)');

      //add resutls to the graph (0, 0)
      var p = this.branch_path.node().getPointAtLength(0);
      this.branch_result = graph.append("path")
        .attr("class", "branch")
        .attr("d", d3.svg.symbol().type("circle"))
        .attr('class', 'branch')
        .attr("transform", function (d) {
          return "translate(" + p.x + "," + p.y + ")";
        });

      p = this.trunk_path.node().getPointAtLength(0);
      this.trunk_result = graph.append("path")
        .attr("class", "trunk")
        .attr("d", d3.svg.symbol().type("triangle-up"))
        .attr('class', 'trunk')
        .attr("transform", function (d) {
          return "translate(" + p.x + "," + p.y + ")";
        });
    },

    /**
     * Add brach LIS results to the graph.
     * @param lis
     */
    add_branch_results: function (lis) {
      this.add_results(this.branch_path.node(), this.branch_result, lis);
    },

    /**
     * Add trunk LIS results to the graph.
     * @param lis
     */
    add_trunk_results: function (lis) {
      this.add_results(this.trunk_path.node(), this.trunk_result, lis);
    },

    /**
     * Add a point to the graph.
     * Iterate along the line length to find the x y of the line at LIS point.
     *
     * @param pathNode
     * @param point
     * @param lis
     */
    add_results: function (pathNode, point, lis) {
      var c = 0, p = {'y': 0};
      do {
        c++;
        p = pathNode.getPointAtLength(c);

        point.transition()
          .duration(2000)
          .attr("transform", function (d) {
            return "translate(" + p.x + "," + p.y + ")";
          });
      } while (p.y < this.y(lis))
    }
  };

}(jQuery));

(function ($) {
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

      placeholder.html(compiled_template(species));
      placeholder.trigger('create');
    }

  };
}(jQuery));



(function ($) {
  app.controller = app.controller || {};
  app.controller.sref = {
    saveData: false,

    pagecreate: function () {
      _log('sref: pagecreate.');

      if (typeof google == 'undefined') {
        $('#sref-opts').disableTab(1);

        /*
         If the browser is offline then we should not proceed and so the
         dummyText controls the caching of the file - always get fresh
         */
        var dummyText = '&' + (new Date).getTime();
        loadScript('http://maps.googleapis.com/maps/api/js?sensor=false&' +
          'callback=app.controller.sref.initializeMap' +
          dummyText
        );
      }
    },

    pagecontainerbeforeshow: function (e, data) {
      app.controller.sref.renderGPStab('init');
      this.saveData = false; //reset
    },

    pagecontainerbeforechange: function (e, data) {
      _log('sref: pagecontainerbeforechange.');
      if (typeof data.toPage === 'object' && data.toPage[0] != null) {
        nextPage = data.toPage[0].id;

        if (this.saveData && this.accuracy != -1) {
          var location = this.saveSref();
          //Save button
          switch (nextPage) {
            case 'record':
              app.controller.record.saveSref(location);
              break;
            default:
              _log('sref: ERROR changing to unknown page.')
          }
        }
      }
    },

    saveSref: function () {
      //save in storage
      var location = {
        'lat': this.latitude,
        'lon': this.longitude,
        'acc': this.accuracy
      };
      app.settings('location', location);
      app.geoloc.set(location.lat, location.lon, location.acc);
      return location;
    },

    /**
     * Should be overwritten by page-specific saving procedure
     */
    save: function () {
      _log('sref: saving Sref.');
      this.saveData = true;
    },

    map: {},
    latitude: null,
    longitude: null,
    accuracy: -1,

    set: function (lat, lon, acc) {
      this.latitude = lat;
      this.longitude = lon;
      this.accuracy = acc;
    },

    get: function () {
      return {
        'lat': this.latitude,
        'lon': this.longitude,
        'acc': this.accuracy
      }
    },

    updateCoordinateDisplay: function (lat, lon, acc) {
      var info = 'Your coordinates: ' + lat + ', ' + lon + ' (Accuracy: ' + acc + ')';
      $('#coordinates').text(info);
    },

    renderGPStab: function (state, location) {
      var template = null;
      var placeholder = $('#sref-gps-placeholder');
      var gref = "";
      var data = {};

      switch (state) {
        case 'init':
          var currentLocation = app.controller.sref.get();
          if (currentLocation.acc == -1) {
            currentLocation = null;
          } else {
            location = currentLocation;
          }

          template = $('#sref-gps').html();
          break;
        case 'running':
          template = $('#sref-gps-running').html();
          break;
        case 'finished':
          template = $('#sref-gps-finished').html();
          break;
        default:
          _log('sref: unknown render gps tab.');
      }

      if (location != null) {
        var p = new LatLonE(location.lat, location.lon, GeoParams.datum.OSGB36);
        var grid = OsGridRef.latLonToOsGrid(p);
        gref = grid.toString();
        location['gref'] = gref;
        data['location'] = location;
      }

      var compiled_template = Handlebars.compile(template);
      placeholder.html(compiled_template(data));
      placeholder.trigger('create');

      //attach event listeners
      $('#gps-start-button').on('click', app.controller.sref.startGeoloc);
      $('#gps-stop-button').on('click', app.controller.sref.stopGeoloc);
      $('#gps-improve-button').on('click', app.controller.sref.startGeoloc);

    },

    /**
     * Starts a geolocation service and modifies the DOM with new UI.
     */
    startGeoloc: function () {
      $.mobile.loading('show');

      function onUpdate(location) {
        //if improved update current location
        var currentLocation = app.controller.sref.get();
        if (currentLocation.acc == -1 || location.acc <= currentLocation.acc) {
          currentLocation = location;
          app.controller.sref.set(location.lat, location.lon, location.acc);
        } else {
          location = currentLocation;
        }

        //modify the UI
        app.controller.sref.renderGPStab('running', location);
      }

      function onSuccess(location) {
        $.mobile.loading('hide');

        app.controller.sref.set(location.lat, location.lon, location.acc);
        app.controller.sref.renderGPStab('finished', location);
      }

      function onError(err) {
        $.mobile.loading('show', {
          text: "Sorry! " + err.message + '.',
          theme: "b",
          textVisible: true,
          textonly: true
        });
        setTimeout(function () {
          $.mobile.loading('hide');
        }, 5000);

        //modify the UI

        app.controller.sref.renderGPStab('init');
      }

      //start geoloc
      app.geoloc.run(onUpdate, onSuccess, onError);

      var location = null;
      var currentLocation = app.controller.sref.get();
      if (currentLocation.acc != -1) {
        location = currentLocation;
      }

      //modify the UI
      app.controller.sref.renderGPStab('running', location);
    },

    /**
     * Stops any geolocation service and modifies the DOM with new UI.
     */
    stopGeoloc: function () {
      $.mobile.loading('hide');

      //stop geoloc
      app.geoloc.stop();

      //modify the UI
      app.controller.sref.renderGPStab('init');
    },

    /**
     * Mapping
     */
    initializeMap: function () {
      _log("sref: initialising map.");
      //todo: add checking
      var mapCanvas = $('#map-canvas')[0];
      var mapOptions = {
        zoom: 5,
        center: new google.maps.LatLng(57.686988, -14.763319),
        zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL
        },
        panControl: false,
        linksControl: false,
        streetViewControl: false,
        overviewMapControl: false,
        scaleControl: false,
        rotateControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
        },
        styles: [
          {
            "featureType": "landscape",
            "stylers": [
              {"hue": "#FFA800"},
              {"saturation": 0},
              {"lightness": 0},
              {"gamma": 1}
            ]
          },
          {
            "featureType": "road.highway",
            "stylers": [
              {"hue": "#53FF00"},
              {"saturation": -73},
              {"lightness": 40},
              {"gamma": 1}
            ]
          },
          {
            "featureType": "road.arterial",
            "stylers": [
              {"hue": "#FBFF00"},
              {"saturation": 0},
              {"lightness": 0},
              {"gamma": 1}
            ]
          },
          {
            "featureType": "road.local",
            "stylers": [
              {"hue": "#00FFFD"},
              {"saturation": 0},
              {"lightness": 30},
              {"gamma": 1}
            ]
          },
          {
            "featureType": "water",
            "stylers": [
              {"saturation": 43},
              {"lightness": -11},
              {"hue": "#0088ff"}
            ]
          },
          {
            "featureType": "poi",
            "stylers": [
              {"hue": "#679714"},
              {"saturation": 33.4},
              {"lightness": -25.4},
              {"gamma": 1}
            ]
          }
        ]
      };
      this.map = new google.maps.Map(mapCanvas, mapOptions);
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(-25.363, 131.044),
        map: app.controller.sref.map,
        icon: 'http://maps.google.com/mapfiles/marker_green.png',
        draggable: true
      });
      marker.setVisible(false);

      var update_timeout = null; //to clear changing of marker on double click
      google.maps.event.addListener(this.map, 'click', function (event) {
        //have to wait for double click
        update_timeout = setTimeout(function () {
          var latLng = event.latLng;
          marker.setPosition(latLng);
          marker.setVisible(true);
          updateMapCoords(latLng);
        }, 200);
      });

      //removes single click action
      google.maps.event.addListener(this.map, 'dblclick', function (event) {
        clearTimeout(update_timeout);
      });

      google.maps.event.addListener(marker, 'dragend', function () {
        var latLng = marker.getPosition();
        updateMapCoords(latLng);
      });

      //Set map centre
      if (this.latitude != null && this.longitude != null) {
        var latLong = new google.maps.LatLng(this.latitude, this.longitude);
        app.controller.sref.map.setCenter(latLong);
        app.controller.sref.map.setZoom(15);
      } else if (navigator.geolocation) {
        //Geolocation
        var options = {
          enableHighAccuracy: true,
          maximumAge: 60000,
          timeout: 5000
        };

        navigator.geolocation.getCurrentPosition(function (position) {
          var latLng = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude);
          app.controller.sref.map.setCenter(latLng);
          app.controller.sref.map.setZoom(15);
        }, null, options);
      }

      this.fixTabMap("#sref-opts", '#map');

      //todo: create event
      $('#sref-opts').enableTab(1);

      function updateMapCoords(mapLatLng) {
        var location = {
          'lat': mapLatLng.lat(),
          'lon': mapLatLng.lng()
        };
        app.controller.sref.set(location.lat, location.lon, 1);

        updateMapInfoMessage('#map-message', location);
      }

      function updateMapInfoMessage(id, location) {
        //convert coords to Grid Ref
        var p = new LatLonE(location.lat, location.lon, GeoParams.datum.OSGB36);
        var grid = OsGridRef.latLonToOsGrid(p);
        var gref = grid.toString();

        var message = $(id);
        message.removeClass();
        message.addClass('success-message');
        message.empty().append('<p>Grid Ref:<br/>' + gref + '</p>');
      }
    },

    /**
     * Fix one tile rendering in jQuery tabs
     * @param tabs
     * @param mapTab
     */
    fixTabMap: function (tabs, mapTab) {
      $(tabs).on("tabsactivate.googleMap", function (event, ui) {
          //check if this is a map tab
          if (ui['newPanel']['selector'] == mapTab) {
            google.maps.event.trigger(app.controller.sref.map, 'resize');
            if (app.controller.sref.latitude != null && app.controller.sref.longitude != null) {
              var latLong = new google.maps.LatLng(app.controller.sref.latitude,
                app.controller.sref.longitude);

              app.controller.sref.map.setCenter(latLong);
              app.controller.sref.map.setZoom(15);
            }
            $(tabs).off("tabsactivate.googleMap");
          }
        }
      );
    },

    gridRefConvert: function () {
      var val = $('#grid-ref').val();
      var gridref = OsGridRef.parse(val);
      if (!isNaN(gridref.easting) && !isNaN(gridref.northing)) {
        var latLon = OsGridRef.osGridToLatLon(gridref);
        this.set(latLon.lat, latLon.lon, 1);

        var gref = val.toUpperCase();
        var message = $('#gref-message');
        message.removeClass();
        message.addClass('success-message');
        message.empty().append('<p>Grid Ref:<br/>' + gref + '</p>');
      }
      //todo: set accuracy dependant on Gref
    }
  };

}(jQuery));

(function ($) {
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
      var type = app.storage.tmpGet(app.controller.record.TYPE);
      var part = app.storage.tmpGet(app.controller.record.PART);
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
        //change the state of the recording: what tree and part of it we are now recording
        var type = $(this).data('type');
        var part = $(this).data('part');

        app.storage.tmpSet(app.controller.record.TYPE, type);
        app.storage.tmpSet(app.controller.record.PART, part);
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
          history.back();
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

      template_data['trunk'] = app.storage.tmpGet(app.controller.record.TYPE) == 'trunk';

      var placeholder = $('#part-placeholder');
      var compiled_template = Handlebars.compile(template);

      app.controller.tree_part.addSelectedSpecies(template_data);

      placeholder.html(compiled_template(template_data));
      placeholder.trigger('create');

      //button listeners
      $('a.zone').on('click', function () {
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

/**
 * Created by karkaz on 20/08/14.
 */
(function ($) {
  app.controller = app.controller || {};
  app.controller.welcome = {

    pagecreate: function () {
      _log('welcome: pagecreate.', app.LOG_DEBUG);

      $('#record-button').on('click', function () {
        app.storage.tmpSet(app.controller.record.RECORDING, true);
      });
    },

    pagecontainershow: function (e, data) {
      _log('welcome: pagecontainershow', app.LOG_DEBUG);
      app.storage.tmpSet(app.controller.record.RECORDING, false);
    }

  };

}(jQuery));

/*!
 * CONFIGURATION.
 * Idea: in the future this might become a JSON service output, so the configuration
 * could also be done on the website UI.
 */

//app wide settings
app.CONF.VERSION = '0.0.2'; //grunt replaced. Application (controllers and data) version
app.CONF.NAME = 'lichen_app'; //grunt replaced.

app.CONF.HOME = "lichen/";
app.CONF.LOG = app.LOG_DEBUG;
app.CONF.APPCACHE_LOADER_URL = 'sites/all/modules/iform_mobile/php/offline.php';


app.auth.CONF.APPNAME = "lichen";
app.auth.CONF.APPSECRET = "mylichen";
app.auth.CONF.WEBSITE_ID = 0;
app.auth.CONF.SURVEY_ID = 0;

app.geoloc.CONF.GPS_ACCURACY_LIMIT = 10; //meters

app.io.CONF.RECORD_URL = "mobile/submit";

//controllers
var c = app.controller;
c.list.CONF.SPECIES_DATA_SRC = "http://192.171.199.230/lichen/serv/species";

c.login.CONF.URL = Drupal.settings.basePath + "user/mobile/register";
c.register.CONF.URL = c.login.CONF.URL;

window.onerror = _onerror;
