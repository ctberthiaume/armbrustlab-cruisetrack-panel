'use strict';

System.register(['app/plugins/sdk', 'lodash', 'jquery', 'app/core/time_series2', './map_renderer'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, $, TimeSeries, mapRenderer, _createClass, panelDefaults, CruiseTrackPanelCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_map_renderer) {
      mapRenderer = _map_renderer.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      panelDefaults = {
        mapCenterLatitude: 0,
        mapCenterLongitude: 0,
        initialZoom: 1,
        tileServerUrl: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        tileServerAttribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        tileServerSubdomains: 'abcd'
      };

      _export('CruiseTrackPanelCtrl', CruiseTrackPanelCtrl = function (_MetricsPanelCtrl) {
        _inherits(CruiseTrackPanelCtrl, _MetricsPanelCtrl);

        function CruiseTrackPanelCtrl($scope, $injector) {
          _classCallCheck(this, CruiseTrackPanelCtrl);

          var _this = _possibleConstructorReturn(this, (CruiseTrackPanelCtrl.__proto__ || Object.getPrototypeOf(CruiseTrackPanelCtrl)).call(this, $scope, $injector));

          _.defaults(_this.panel, panelDefaults);
          _this.series = [];
          _this.mapdata = [];
          _this.debouncedChange = _.debounce(function () {
            if (_this.map) {
              // erase map
              _this.map.remove();
              _this.map = undefined;
            }
            _this.render();
          }, 3000);
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          return _this;
        }

        _createClass(CruiseTrackPanelCtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/armbrustlab-cruisetrack-panel/edit.html', 2);
          }
        }, {
          key: 'editChanged',
          value: function editChanged() {
            this.debouncedChange();
          }
        }, {
          key: 'onDataError',
          value: function onDataError(err) {
            this.onDataReceived([]);
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            //console.log('map onDataReceived()');
            this.series = dataList.map(this.seriesHandler.bind(this));
            var lats = [],
                lons = [],
                mapdata = [];
            this.series.forEach(function (s) {
              if (s.alias === 'lat' || s.alias === 'latitude') {
                lats = s.datapoints;
              } else if (s.alias === 'lon' || s.alias === 'longitude') {
                lons = s.datapoints;
              }
            });
            if (lats.length && lats.length === lons.length) {
              lats.forEach(function (lat, i) {
                mapdata.push({
                  lat: lat[0],
                  lon: lons[i][0],
                  time: lat[1]
                });
              });
              this.mapdata = mapdata;
            }
            this.render();
          }
        }, {
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {
            var serie = new TimeSeries({
              datapoints: seriesData.datapoints,
              alias: seriesData.target
            });
            return serie;
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
            mapRenderer(scope, elem, attrs, ctrl);
          }
        }]);

        return CruiseTrackPanelCtrl;
      }(MetricsPanelCtrl));

      _export('CruiseTrackPanelCtrl', CruiseTrackPanelCtrl);

      CruiseTrackPanelCtrl.templateUrl = 'template.html';
    }
  };
});
//# sourceMappingURL=ctrl.js.map
