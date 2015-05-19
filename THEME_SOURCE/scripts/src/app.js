(function($){
  app.data = app.data || {};
  checkForUpdates();
  app.initialize();

  (function() {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-58378803-1', 'auto');
    ga('set', 'appName', app.NAME);
    ga('set', 'appVersion', app.VERSION);

    ga('send', 'pageview');

    if (app.CONF.GA.STATUS) {
      $(document).on("pageshow", function(e){
        // Record page view
        ga('send', {
          'hitType': 'pageview',
          'page': e.target.id
        });
      });
    }
  })();

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
          var trunks = convertToWarehouse(value['trunk']);
          //add branches
          var branches = convertToWarehouse(value['branch']);

          var species = $.extend(trunks, branches);
          var speciesKeys = Object.keys(species);
          for (var i = 0; i < speciesKeys.length; i++) {
            data.append(speciesKeys[i], species[speciesKeys[i]])
          }

          function convertToWarehouse (trees) {
            var speciesData = {};
            var treeNumberIDs = Object.keys(trees);
            //every tree
            for (var i = 0; i < treeNumberIDs.length; i++) {
              //every part of tree
              var treeNumberID = treeNumberIDs[i];
              var treePartIDs = Object.keys(trees[treeNumberID]);
              for (var j = 0; j < treePartIDs.length; j++) {
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