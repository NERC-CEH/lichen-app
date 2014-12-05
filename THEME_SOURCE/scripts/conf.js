/*!
 * CONFIGURATION.
 * Idea: in the future this might become a JSON service output, so the configuration
 * could also be done on the website UI.
 */

app.version = '0'; //application controllers version
app.name = '';

//app wide settings
app.CONF.NAME = "lichen_app";
app.CONF.HOME = "lichen/";
app.CONF.LOG = app.LOG_DEBUG;

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
