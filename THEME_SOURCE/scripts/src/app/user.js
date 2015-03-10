(function ($) {
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
          var record = {};
          record.id = savedRecordIDs[i];

          var inputKeys = Object.keys(savedRecords[record.id]);
          for (var j = 0, inputsLength = inputKeys.length; j < inputsLength; j++) {
            var value = savedRecords[record.id][inputKeys[j]];
            var name = value.name;
            switch (name) {
              case app.record.inputs.KEYS.DATE:
                record.date = value.value;
                break;
              default:
            }
          }
          records.push(record);
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

      app.record.db.getAll(onSuccess);
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

          app.record.db.remove(recordKey, function () {
            app.controller.user.printList();
          });
        };

        onError = function (xhr, ajaxOptions, thrownError) {
          if (!xhr.responseText) {
            xhr.responseText = "Sorry. Some Error Occurred."
          }
          _log("user: ERROR record ajax (" + xhr.status + " " + thrownError + ").", app.LOG_ERROR);
          _log(xhr.responseText, app.LOG_ERROR);

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

        app.io.sendSavedRecord(recordKey, onSuccess, onError);
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
      app.record.db.remove(recordKey, function () {
        app.controller.user.printList();
      });
    },

    sendAllSavedRecords: function () {
      function onSuccess() {
        app.controller.user.printList();
      }

      app.io.sendAllSavedRecords(onSuccess);
    }

  };

}(jQuery));