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
  HOME: "http://www.apis.ac.uk/lichen-app",
  SPECIES_DATA_URL: "http://www.apis.ac.uk/serv/species",
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
      'birch': 5202, 'oak': 5203
    },
    treePart: {
      'e': 5213, 's': 5214, 'w': 5215,
      'one': 5216, 'two': 5217, 'three': 5218
    },
    treeNumber: [5208, 5209, 5210, 5211, 5212]
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
  STATE: log.INFO,
  GA_ERROR: true //log error using google analytics
};
window.onerror = log.onError;

//morel
morel.geoloc.CONF.GPS_ACCURACY_LIMIT = 50; //meters
morel.io.CONF.RECORD_URL = "http://www.apis.ac.uk/mobile/submit";
morel.CONF.NAME = app.CONF.NAME;
$.extend(morel.auth.CONF, {
  APPNAME: "lichen",
  APPSECRET: "4n2cIuqi9t60TZtYy6aKQ",
  WEBSITE_ID: 77,
  SURVEY_ID: 307
});
$.extend(morel.record.inputs.KEYS, {
  TREE_TYPE: 'smpAttr:621',
  TREE_NUMBER: 'occAttr:425',
  TREE_PART: 'occAttr:426',
  TRUNK_NAQI: 'smpAttr:613',
  BRANCH_NAQI: 'smpAttr:619',
  TRUNK_LIS: 'smpAttr:620',
  BRANCH_LIS: 'smpAttr:612',
  TREE_CIRCUM_1: 'smpAttr:618',
  TREE_CIRCUM_2: 'smpAttr:617',
  TREE_CIRCUM_3: 'smpAttr:616',
  TREE_CIRCUM_4: 'smpAttr:615',
  TREE_CIRCUM_5: 'smpAttr:614',
  EMAIL: 'smpAttr:623',
  SREF_NAME: 'sample:location_name'
});




