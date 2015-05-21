(function ($) {
  window.app = window.app || {};
  app.controller = app.controller || {};
  app.controller.results = {

    y: null,
    x: null,

    trunk_path: null,
    branch_path: null,

    trunk_result: null,
    branch_result: null,

    pagecreate: function () {
      _log('results: pagecreate', log.DEBUG);

      //attach button listeners
      $('#send-button').on('click', app.controller.results.send);
      $('#save-button').on('click', app.controller.results.save);
    },

    pagecontainershow: function () {
      _log('results: pagecontaintershow', log.DEBUG);
      // draw the graph
      this.drawgraph();

      //compile results
      var species = app.controller.list.getAllSpecies();

      //lis
      var trunk_lis = this.calculateLIS(species['trunk']);
      var branch_lis = this.calculateLIS(species['branch']);

      //naqi
      if (trunk_lis || trunk_lis === 0){
        morel.record.inputs.set(morel.record.inputs.KEYS.TRUNK_LIS, trunk_lis);

        var naqi = (3.6666666 - trunk_lis) / 3.33333;
        morel.record.inputs.set(morel.record.inputs.KEYS.TRUNK_NAQI, naqi);

        this.add_trunk_results(trunk_lis);
        $('#results-trunk-lis').text(trunk_lis.toFixed(1));
        $('#results-trunk-naqi').text(naqi.toFixed(1));
        this.setPollutionMessage('#results-trunk-info', naqi);
        $('#results-trunk').show();
        _log('results: trunk_lis: ' + trunk_lis);
      }
      if (branch_lis || trunk_lis === 0) {
        morel.record.inputs.set(morel.record.inputs.KEYS.BRANCH_LIS, branch_lis);

        var naqi = (3.4 - branch_lis) / 4;
        morel.record.inputs.set(morel.record.inputs.KEYS.BRANCH_NAQI, naqi);

        this.add_branch_results(branch_lis);
        $('#results-branch-lis').text(branch_lis.toFixed(1));
        $('#results-branch-naqi').text(naqi.toFixed(1));
        this.setPollutionMessage('#results-branch-info', naqi);
        $('#results-branch').show();
        _log('results: branch_lis: ' + branch_lis);
      }
    },

    /**
     * Calculates the Lichen Indicator Index.
     */
    calculateLIS: function (type) {
      var tolerant = 0;
      var sensitive = 0;

      var parts = Object.keys(type);

      //return early
      if (parts.length === 0){
        return null;
      }

      for (var i = 0; i < parts.length; i++) {
        var zones = Object.keys(type[parts[i]]);
        for (var j = 0; j < zones.length; j++) {
          var species = type[parts[i]][zones[j]];
          if (has('tolerant', species)) {
            tolerant++;
          }
          if (has('sensitive', species)) {
            sensitive++;
          }
        }
      }

      function has(lichen_type, species) {
        if (species == null) {
          return false;
        }
        var species_categorized = app.controller.list.categorizeSpecies(species);

        if (lichen_type == 'sensitive') {
          return species_categorized['sensitive'].length > 0;
        } else if (lichen_type == 'tolerant') {
          return species_categorized['tolerant'].length > 0;
        } else {
          _log('results: no such lichen type.', log.ERROR);
        }
      }

      return (sensitive - tolerant) / parts.length;
    },

    setPollutionMessage: function (id, naqi) {
      var $messagePlaceholder = $(id);
      var message = '';
      switch(true) {
        case naqi > 1.25:
          message = '(Very Nitrogen polluted)';
          $messagePlaceholder.addClass('nitrogen-very-polluted');
          break;
        case naqi > 0.86:
          message = '(Nitrogen polluted)';
          $messagePlaceholder.addClass('nitrogen-polluted');
          break;
        case naqi > 0.5:
          message = '(At risk)';
          $messagePlaceholder.addClass('nitrogen-risk');
          break;
        default:
          message = '(Clean)';
          $messagePlaceholder.addClass('nitrogen-clean');
      }
      $messagePlaceholder.text(message);
    },

    /*
     * Validates and sends the record. Saves it if no network.
     */
    send: function () {
      $.mobile.loading('show');

      function onError(err) {
        $.mobile.loading('hide');
        var message = "<center><h3>Sorry!</h3></center>" +
          "<p>" + err.message + "</p>";
        app.message(message);

        _log("results: record ajax (" + err.message + ").", log.ERROR);
      }

      if (navigator.onLine) {
        //online
        function onOnlineSuccess() {
          $.mobile.loading('hide');
          app.message("<center><h2>Submitted successfully. " +
          "</br>Thank You!</h2></center>");

          //clean the old record
          app.controller.record.clear();

          //Send update to Google Analytics
          if (app.CONF.GA.STATUS){
            ga('send', 'event', 'app', 'sendRecordSuccess');
          }
          setTimeout(function () {
            $("body").pagecontainer("change", "#welcome");
          }, 3000);
        }

        app.controller.results.processOnline(onOnlineSuccess, onError);
      } else {
        //offline
        function onSaveSuccess() {
          $.mobile.loading('hide');
          app.message("<center><h2>No Internet. Record saved.</h2></center>");
          setTimeout(function () {
            $("body").pagecontainer("change", "#welcome");
          }, 3000);
        }

        app.controller.results.processOffline(onSaveSuccess, onError)
      }
    },

    /*
     * Validates and saves the record.
     */
    save: function () {
      $.mobile.loading('show');

      function onSuccess() {
        $.mobile.loading('hide');
        app.message("<center><h2>Record saved.</h2></center>");

        //clean the old record
        app.controller.record.clear();

        setTimeout(function () {
          $("body").pagecontainer("change", "#welcome");
        }, 3000);
      }

      function onError(err) {
        $.mobile.loading('hide');
        var message = "<center><h3>Sorry!</h3></center>" +
          "<p>" + err.message + "</p>";
        //xhr.status+ " " + thrownError + "</p><p>" + xhr.responseText +
        app.message(message)
        $("body").pagecontainer("change", "#welcome");
      }

      app.controller.results.processOffline(onSuccess, onError);
    },

    /**
     * Saves and submits the record.
     */
    processOnline: function (callback, onError) {
      _log("record: process online.");
      var onSaveSuccess = function (savedRecordId) {
        morel.record.clear();

        function onSendSuccess() {
          morel.record.db.remove(savedRecordId);
          if (callback != null) {
            callback();
          }
        }

        //#2 Post the record
        morel.io.sendSavedRecord(savedRecordId, onSendSuccess, onError);
      };
      //#1 Save the record first
      morel.record.db.save(null, onSaveSuccess, onError);
    },

    /**
     * Saves the record.
     */
    processOffline: function (callback, onError) {
      _log("record: process offline");
      var onSaveSuccess = function (savedRecordId) {
        morel.record.clear();

        if (callback != null) {
          callback();
        }
      };
      morel.record.db.save(null, onSaveSuccess, onError);
    },

    drawgraph: function () {
      var container = $('#graph-container');

      // define dimensions of graph
      var m = [40, 10, 80, 20]; // margins
      var w = container.width() - m[1] - m[3]; // width
      var h = container.height() - m[0] - m[2]; // height

      var data = [3.6, 0.3, -3];
      var data2 = [3.4, -0.4, -4.6];

      //scales
      var formatxAxis = d3.format('.0f');

      this.x = d3.scale.linear().domain([0, 2]).range([0, w]);
      this.y = d3.scale.linear().domain([-3, 4]).range([h, 0]);

      // create a line function that can convert data[] into x and y points
      var line = d3.svg.line()
        // assign the X function to plot our line as we wish
        .x(function (d, i) {
          // return the X coordinate where we want to plot this datapoint
          return app.controller.results.x(i);
        })
        .y(function (d) {
          // return the Y coordinate where we want to plot this datapoint
          return app.controller.results.y(d);
        });

      // Add an SVG element with the desired dimensions and margin.
      var graph = d3.select("#graph-container").append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

      var gradient = graph.append("svg:defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("spreadMethod", "pad");

      gradient.append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", "lightgreen")
        .attr("stop-opacity", 1);

      gradient.append("svg:stop")
        .attr("offset", "30%")
        .attr("stop-color", "lightgrey")
        .attr("stop-opacity", 1);

      gradient.append("svg:stop")
        .attr("offset", "50%")
        .attr("stop-color", "#FFFF66")
        .attr("stop-opacity", 1);

      gradient.append("svg:stop")
        .attr("offset", "70%")
        .attr("stop-color", "#FF6666")
        .attr("stop-opacity", 1);

      graph.append("svg:rect")
        .attr("width", w)
        .attr("height", h)
        .style("fill", "url(#gradient)");

      // create axis
      var xAxis = d3.svg.axis().scale(this.x).tickValues([0.1, 0.5, 1.0, 1.5, 2.0]);
      graph.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis);
      var yAxisLeft = d3.svg.axis().scale(this.y).ticks(4).tickSize(-w).orient("left");
      graph.append("svg:g")
        .style("stroke-dasharray", ("1, 1"))
        .attr("class", "y axis")
        .call(yAxisLeft);

      //axis labels
      graph.append("text")
        .attr("y", -m[0] * 0.7)
        .attr("x", 0)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("(LIS)");

      graph.append("text")
        .attr("y", h + m[3])
        .attr("x", w - m[0])
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("(NAQI)");

      // Add the clip path.
      graph.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", w)
        .attr("height", h);

      //add lines
      //trunk:
      this.trunk_path = graph.append("svg:path")
        .attr('class', 'trunk')
        .attr("d", line(data)).attr('clip-path', 'url(#clip)');

      //branch:
      this.branch_path = graph.append("svg:path")
        .attr('class', 'branch')
        .style("stroke-dasharray", ("5, 5, 5, 9, 9"))

        .attr("d", line(data2)).attr('clip-path', 'url(#clip)');

      //add resutls to the graph (0, 0)
      var p = this.branch_path.node().getPointAtLength(0);
      this.branch_result = graph.append("path")
        .attr("class", "branch")
        .attr("d", d3.svg.symbol().type("circle"))
        .attr('class', 'branch')
        .attr("transform", function (d) {
          return "translate(" + p.x + "," + p.y + ")";
        });

      p = this.trunk_path.node().getPointAtLength(0);
      this.trunk_result = graph.append("path")
        .attr("class", "trunk")
        .attr("d", d3.svg.symbol().type("triangle-up"))
        .attr('class', 'trunk')
        .attr("transform", function (d) {
          return "translate(" + p.x + "," + p.y + ")";
        });

      var legend = graph.append('g')
        .attr('class', 'results-legend')
        .attr("transform", "translate(0," + h + ")")
        .attr('width', 100)
        .attr('height', 100);

      legend.append('path')
        .attr('class', 'trunk')
        .attr('d', 'M1,55 L40, 55');

      legend.append('text')
        .text('Trunk')
        .attr('transform', 'translate(45, 60)');

      legend.append('path')
        .attr('class', 'branch')
        .style("stroke-dasharray", ("5, 5, 5, 9, 9"))
        .attr("d", 'm110,55 L145,55');

      legend.append('text')
        .text('Branch')
        .attr("transform", "translate(150,60)");
    },

    /**
     * Add brach LIS results to the graph.
     * @param lis
     */
    add_branch_results: function (lis) {
      this.add_results(this.branch_path.node(), this.branch_result, lis);
    },

    /**
     * Add trunk LIS results to the graph.
     * @param lis
     */
    add_trunk_results: function (lis) {
      this.add_results(this.trunk_path.node(), this.trunk_result, lis);
    },

    /**
     * Add a point to the graph.
     * Iterate along the line length to find the x y of the line at LIS point.
     *
     * @param pathNode
     * @param point
     * @param lis
     */
    add_results: function (pathNode, point, lis) {
      var c = 0, p = {'y': 0};
      do {
        c++;
        p = pathNode.getPointAtLength(c);

        point.transition()
          .duration(2000)
          .attr("transform", function (d) {
            return "translate(" + p.x + "," + p.y + ")";
          });
      } while (p.y < this.y(lis))
    }
  };

}(jQuery));