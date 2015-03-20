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
  HOME: "http://192.171.199.230/lichen/app/main",

  //app feature settings
  FEATURES: {
    SEND_RECORD: true
  },

  WAREHOUSE_VALUES: {
    treeType: {
      'birch': 3183, 'oak': 3184
    },
    treePart: {
      'e': 3173, 's': 3174, 'w': 3175,
      'one': 3176, 'two': 3177, 'three': 3178
    },
    treeNumber: [3185, 3186, 3187, 3188, 3189]
  }
};

//logging
log.CONF = {
  STATE: log.DEBUG,
  ERROR_URL: "http://192.171.199.230/lichen/mobile/log",
  APP_NAME: app.NAME,
  APP_VERSION: app.VERSION
};

//morel
morel.CONF.NAME = app.CONF.NAME;
morel.auth.CONF = {
  APPNAME: "lichen",
  APPSECRET: "mylichen",
  WEBSITE_ID: 101,
  SURVEY_ID: 184
};

jQuery.extend(morel.record.inputs.KEYS, {
  TREE_TYPE: 'smpAttr:433',
  TREE_NUMBER: 'occAttr:230',
  TREE_PART: 'occAttr:229',
  TRUNK_LIS: 'smpAttr:434',
  BRANCH_LIS: 'smpAttr:441',
  TREE_CIRCUM_1: 'smpAttr:443',
  TREE_CIRCUM_2: 'smpAttr:444',
  TREE_CIRCUM_3: 'smpAttr:445',
  TREE_CIRCUM_4: 'smpAttr:446',
  TREE_CIRCUM_5: 'smpAttr:447',
  EMAIL: 'smpAttr:14',
  SREF_NAME: 'smpAttr:442'
});

morel.geoloc.CONF.GPS_ACCURACY_LIMIT = 10; //meters
morel.io.CONF.RECORD_URL = "http://192.171.199.230/lichen/mobile/submit";

//controllers
var c = app.controller;
c.list.CONF.SPECIES_DATA_SRC = "http://192.171.199.230/lichen/serv/species";

//window.onerror = _onerror;

