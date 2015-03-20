/*!
 * App wide logic.
 */

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
 * Takes care of application execution logging.
 *
 * Depends on morel.
 *
 * Uses 5 levels of logging:
 *  0: none
 *  1: errors
 *  2: warnings
 *  3: information
 *  4: debug
 *
 * Levels values defined in core app module.
 *
 * @param message
 * @param level
 * @private
 */

window.log = {
  NONE: 0,
  ERROR: 1,
  WARNING: 2,
  INFO: 3,
  DEBUG: 4,

  CONF: {
    STATUS: 4,
    ERROR_URL: '',
    APP_NAME: '',
    APP_VERSION: ''
  },

  core: function (message, level) {
    "use strict";
    //do nothing if logging turned off
    if (log.CONF.STATE === log.NONE) {
      return;
    }

    if (log.CONF.STATE >= level || !level) {
      switch (level) {
        case log.ERROR:
          log.error(log.CONF.ERROR_URL, message);
          break;
        case log.WARNING:
          console.warn(message);
          break;
        case log.INFO:
          console.log(message);
          break;
        case log.DEBUG:
        /* falls through */
        default:
          //IE does not support console.debug
          if (!console.debug) {
            console.log(message);
            break;
          }
          console.debug(message);
      }
    }
  },


  /**
   * Prints and posts an error to the mobile authentication log.
   *
   * @param error object holding a 'message', and optionally 'url' and 'line' fields.
   * @private
   */
  error: function (errorLogURL, error) {
    "use strict";
    //print error
    console.error(error.message, error.url, error.line);

    //prepare the message
    var message = '<b style="color: red">' + error.message + '</b>';
    message += '</br><b> morel version = </b><i>"' + morel.VERSION + '"</i>';

    message += '</br><b> app name = </b><i>"' + log.CONF.APP_NAME + '"</i>';
    message += '</br><b> app version = </b><i>"' + log.CONF.APP_VERSION + '"</i></br>';

    //browser info
    message += '</br>' + navigator.appName;
    message += '</br>' + navigator.appVersion;

    var url = error.url + ' (' + error.line + ')';

    if (navigator.onLine) {
      //send to server

      var data = {};
      data.append = function (name, value) {
        this[name] = value;
      };
      data.append('message', message);
      data.append('url', url);
      morel.auth.appendApp(data);

      //removing unnecessary information
      delete data.append;

      jQuery.ajax({
        url: errorLogURL,
        type: 'post',
        dataType: 'json',
        success: function (data) {
          console.log(data);
        },
        data: data
      });
    }
  },

  /**
   * Hook into window.error function.
   *
   * @param message
   * @param url
   * @param line
   * @returns {boolean}
   * @private
   */
  onError: function (message, url, line) {
    "use strict";
    window.onerror = null;

    var error = {
      'message': message,
      'url': url || '',
      'line': line || -1
    };

    _log(error, log.ERROR);

    window.onerror = this; // turn on error handling again
    return true; // suppress normal error reporting
  }

};

window._log = log.core;

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

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}