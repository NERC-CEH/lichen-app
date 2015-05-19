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
  SPECIES_DATA_URL: "http://192.171.199.230/lichen/serv/species",
  GA: {
    //Google Analytics settings
    STATUS: true,
    ID: 'UA-58378803-1'
  },
  //app feature settings
  FEATURES: {
    SEND_RECORD: true,
    OFFLINE: true
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
  },
  MAP: {
    zoom: 5,
    zoomControl: true,
    zoomControlOptions: {
      style: 1
    },
    panControl: false,
    linksControl: false,
    streetViewControl: false,
    overviewMapControl: false,
    scaleControl: false,
    rotateControl: false,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: 1
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
        "elementType": "labels",
        "stylers": [
          { "visibility": "off" }
        ]
      }
    ]
  }
};

//historic
app.NAME = app.CONF.NAME; //remove the ones from CONF
app.VERSION = app.CONF.VERSION;

//logging
log.CONF = {
  STATE: log.DEBUG,
  GA_ERROR: true //log error using google analytics
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

//window.onerror = _onerror;

