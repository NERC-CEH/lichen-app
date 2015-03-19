(function ($) {
  window.app = window.app || {};
  app.controller = app.controller || {};
  app.controller.user = {

    pagecontainershow: function () {
      this.printList();
    },

    printList: function () {
      function onSuccess(savedRecords) {
        var records = [];
        var savedRecordIDs = Object.keys(savedRecords);
        for (var i = 0, length = savedRecordIDs.length; i < length; i++) {
          var record = savedRecords[savedRecordIDs[i]];
          var recordInfo = {};
          recordInfo.id = record.id;

          var inputKeys = Object.keys(record);
          for (var j = 0, inputsLength = inputKeys.length; j < inputsLength; j++) {
            var name = inputKeys[j];
            var value = record[name];
            switch (name) {
              case morel.record.inputs.KEYS.DATE:
                recordInfo.date = value;
                break;
              case morel.record.inputs.KEYS.TRUNK_LIS:
                recordInfo.trunk_lis = value;
                break
              case morel.record.inputs.KEYS.BRANCH_LIS:
                recordInfo.branch_lis = value;
                break;
              default:
            }
          }
          records.push(recordInfo);
        }

        var placeholder = $('#saved-list-placeholder');

        var template = $('#saved-list-template').html();
        var compiled_template = Handlebars.compile(template);

        placeholder.html(compiled_template({'records': records}));
        placeholder.trigger('create');


        //attach button listeners
        $('.delete-button').on('click', app.controller.user.deleteSavedRecord);
        $('.send-button').on('click',  app.controller.user.sendSavedRecord);
      }

      morel.record.db.getAll(onSuccess);
    },

    sendSavedRecord: function (e) {
      var recordKey = $(e.currentTarget).data('id');

      var onSuccess = null, onError = null;
      if (navigator.onLine) {
        $.mobile.loading('show');

        onSuccess = function () {
          $.mobile.loading('show', {
            text: "Done!",
            theme: "b",
            textVisible: true,
            textonly: true
          });

          setTimeout(function () {
            $.mobile.loading('hide');
          }, 3000);

          morel.record.db.remove(recordKey, function () {
            app.controller.user.printList();
          });
        };

        onError = function (xhr, ajaxOptions, thrownError) {
          if (!xhr.responseText) {
            xhr.responseText = "Sorry. Some Error Occurred."
          }
          _log("user: ERROR record ajax (" + xhr.status + " " + thrownError + ").", morel.LOG_ERROR);
          _log(xhr.responseText, morel.LOG_ERROR);

          $.mobile.loading('show', {
            text: xhr.responseText,
            theme: "b",
            textVisible: true,
            textonly: true
          });

          setTimeout(function () {
            $.mobile.loading('hide');
          }, 10000);
        };

        morel.io.sendSavedRecord(recordKey, onSuccess, onError);
      } else {
        $.mobile.loading('show', {
          text: "Looks like you are offline!",
          theme: "b",
          textVisible: true,
          textonly: true
        });

        setTimeout(function () {
          $.mobile.loading('hide');
        }, 3000);
      }
    },

    deleteSavedRecord: function (e) {
      var recordKey = $(e.currentTarget).data('id');
      morel.record.db.remove(recordKey, function () {
        app.controller.user.printList();
      });
    },

    sendAllSavedRecords: function () {
      function onSuccess() {
        app.controller.user.printList();
      }

      morel.io.sendAllSavedRecords(onSuccess);
    }

  };

}(jQuery));