/*!
 * CONFIGURATION.
 * Idea: in the future this might become a JSON service output, so the configuration
 * could also be done on the website UI.
 */

//app wide settings
$ = jQuery;

app.CONF = {
  VERSION: '0', //version grunt replaced //Application (controllers and data) version
  NAME: 'app', //name grunt replaced
  HOME: "lichen/",
  LOG: morel.LOG_DEBUG,
  APPCACHE_LOADER_URL: Drupal.settings.themePath + 'scripts/offline.php',

  //app feature settings
  FEATURES: {
    SEND_RECORD: true
  }
};

morel.auth.CONF = {
  APPNAME: "lichen",
  APPSECRET: "mylichen",
  WEBSITE_ID: 0,
  SURVEY_ID: 0
};

jQuery.extend(morel.record.inputs.KEYS, {
  TREE_TYPE: 'sample:tree_type',
  CIRCUMFERENCE: 'sample:circumference',
  EMAIL: 'sample:email',
  SREF_NAME: 'sample:locationName'
});

morel.geoloc.CONF.GPS_ACCURACY_LIMIT = 10; //meters

morel.io.CONF.RECORD_URL = "mobile/submit";

//controllers
var c = app.controller;
c.list.CONF.SPECIES_DATA_SRC = "http://192.171.199.230/lichen/serv/species";

//window.onerror = _onerror;

