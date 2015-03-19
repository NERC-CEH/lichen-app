/*!
 * App wide logic.
 */

app.data = app.data || {};

app.initialize = function () {
  /**
   * Events from.
   * http://jqmtricks.wordpress.com/2014/03/26/jquery-mobile-page-events/
   */
  var pageEvents = [
    'pagebeforecreate',
    'pagecreate',
    'pagecontainerbeforechange ',
    'pagecontainerbeforetransition',
    'pagecontainerbeforehide',
    'pagecontainerhide',
    'pagecontainerbeforeshow',
    'pagecontainershow',
    'pagecontainertransition',
    'pagecontainerchange',
    'pagecontainerchangefailed',
    'pagecontainerbeforeload',
    'pagecontainerload',
    'pagecontainerloadfailed',
    'pagecontainerremove'
  ];

  /**
   * Init function.
   */
  (function () {
    _log('APP: initialised.', morel.LOG_INFO);

    //todo: needs tidying up
    //Bind JQM page events with page controller handlers
    jQuery(document).on(pageEvents.join(' '), function (e, data) {
      var event = e.type;
      var id = null;
      switch (event) {
        case 'pagecreate':
        case 'pagecontainerbeforechange':
          id = data.prevPage != null ? data.prevPage[0].id : e.target.id;
          break;

        case 'pagebeforecreate':
          id = e.target.id;
          break;

        case 'pagecontainershow':
        case 'pagecontainerbeforetransition':
        case 'pagecontainerbeforehide':
        case 'pagecontainerbeforeshow':
        case 'pagecontainertransition':
        case 'pagecontainerhide':
        case 'pagecontainerchangefailed':
        case 'pagecontainerchange':
          id = data.toPage[0].id;
          break;

        case 'pagecontainerbeforeload':
        case 'pagecontainerload':
        case 'pagecontainerloadfailed':
        default:
          break;
      }

      //  var ihd = e.target.id || data.toPage[0].id;
      var controller = app.controller[id];

      //if page has controller and it has an event handler
      if (controller && controller[event]) {
        controller[event](e, data);
      }
    });
  })();
};

/**
 * Displays a self disappearing lightweight message.
 *
 * @param text
 * @param time 0 if no hiding, null gives default 3000ms delay
 */
app.message = function (text, time) {
  if (!text) {
    _log('NAVIGATION: no text provided to message.', morel.LOG_ERROR);
    return;
  }

  var messageId = 'morelLoaderMessage';

  text = '<div id="' + messageId + '">' + text + '</div>';

  $.mobile.loading('show', {
    theme: "b",
    textVisible: true,
    textonly: true,
    html: text
  });

  //trigger JQM beauty
  $('#' + messageId).trigger('create');

  if (time !== 0) {
    setTimeout(function () {
      $.mobile.loading('hide');
    }, time || 3000);
  }
};

/**
 * Generic function to detect the browser
 *
 * Chrome has to have and ID of both Chrome and Safari therefore
 * Safari has to have an ID of only Safari and not Chrome
 */
app.browserDetect = function (browser) {
  "use strict";
  if (browser === 'Chrome' || browser === 'Safari') {
    var isChrome = navigator.userAgent.indexOf('Chrome') > -1,
      isSafari = navigator.userAgent.indexOf("Safari") > -1,
      isMobile = navigator.userAgent.indexOf("Mobile") > -1;

    if (isSafari) {
      if (browser === 'Chrome') {
        //Chrome
        return isChrome;
      }
      //Safari
      return !isChrome;
    }
    if (isMobile) {
      //Safari homescreen Agent has only 'Mobile'
      return true;
    }
    return false;
  }
  return (navigator.userAgent.indexOf(browser) > -1);
};

(function($){
    checkForUpdates();
    app.initialize();

    //Fixing back buttons for Mac 7.* History bug.
    $(document).on('pagecreate', function(event, ui) {
        if (app.browserDetect('Safari')){
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
    morel.record.db.getData =  function(recordKey, callback, onError){
        function onSuccess(savedRecord) {
            var data = new FormData();

            var savedRecordIDs = Object.keys(savedRecord);
            for (var k = 0, length = savedRecordIDs.length; k < length; k++) {
              var name = savedRecordIDs[k];
              var value = savedRecord[name];
              if (name !== 'species'){
                data.append(name, value);
              } else {
                //convert species array into Indicia warehouse inputs:
                //  sc:species-0::present = 521853
                //  sc:species-0::occAttr:230 = 3185
                //  sc:species-0::occAttr:229 = 3173

                var dataSpeciesCount = 0; //species counter

                //add trunks
                var trunks = convertToWarehouse(value['trunk'], 'trunk');

                //add branches
                var branches = convertToWarehouse(value['branch'], 'branch');

                var species = $.extend(trunks, branches);

                var speciesKeys = Object.keys(species);
                for (var i = 0; i < speciesKeys.length; i++) {
                  data.append(speciesKeys[i], species[speciesKeys[i]])
                }

                function convertToWarehouse (trees, type) {
                  var speciesData = {};
                  var treeNumberIDs = Object.keys(trees);
                  //every tree
                  for (var i = 0; i < treeNumberIDs.length; i++) {
                    //every part of tree
                    var treeNumberID = treeNumberIDs[i];
                    var treePartIDs = Object.keys(trees[treeNumberID]);
                    for (var j = 0; j < treeNumberIDs.length; j++) {
                      var treePartID = treePartIDs[j];
                      var species = trees[treeNumberID][treePartID];
                      //every specie
                      for (var l = 0; l < species.length; l++) {
                        //add specie
                        var specie = species[l];
                        ////convert speciesID to warehouseID
                        for (var n = 0; n < app.data.species.length; n++) {
                          if (app.data.species[n].id === specie) {
                            specie = app.data.species[n].warehouse_id;
                            break;
                          }
                        }
                        var name = 'sc:species-' + dataSpeciesCount + '::present';
                        speciesData[name] = specie;

                        //add treeNum
                        name = 'sc:species-' + dataSpeciesCount + '::' + morel.record.inputs.KEYS.TREE_NUMBER;
                        speciesData[name] = app.CONF.WAREHOUSE_VALUES.treeNumber[treeNumberID - 1];

                        //add treePart
                        name = 'sc:species-' + dataSpeciesCount + '::' + morel.record.inputs.KEYS.TREE_PART;
                        speciesData[name] = app.CONF.WAREHOUSE_VALUES.treePart[treePartID];

                        dataSpeciesCount++;
                      }
                    }
                  }
                  return speciesData;
                }
              }
            }
            callback(data);
        }

        //Extract data from database
        this.get(recordKey, onSuccess, onError);
    };

}(app.$ || jQuery));

/**
 * Updates the app's data if the source code version mismatches the
 * stored data's version.
 */
function checkForUpdates(){
    var CONTROLLER_VERSION_KEY = 'controllerVersion';
    var controllerVersion = morel.settings(CONTROLLER_VERSION_KEY);
    //set for the first time
    if (controllerVersion == null){
        morel.settings(CONTROLLER_VERSION_KEY, app.CONF.VERSION);
        return;
    }

    if (controllerVersion != app.CONF.VERSION){
        _log('app: controller version differs. Updating the app.', morel.LOG_INFO);

        //TODO: add try catch for any problems
        morel.storage.remove('species');
        morel.storage.tmpClear();

        //set new version
        morel.settings(CONTROLLER_VERSION_KEY, app.CONF.VERSION);
    }
}