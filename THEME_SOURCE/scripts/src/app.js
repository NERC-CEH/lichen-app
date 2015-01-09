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