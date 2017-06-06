'use strict';

System.register(['lodash', './external/leaflet/leaflet', './external/leaflet/L.Control.MousePosition'], function (_export, _context) {
  "use strict";

  var _, L, _createClass, WorldMap;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_externalLeafletLeaflet) {
      L = _externalLeafletLeaflet.default;
    }, function (_externalLeafletLControlMousePosition) {}],
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

      WorldMap = function () {
        function WorldMap(ctrl, mapContainer) {
          _classCallCheck(this, WorldMap);

          this.ctrl = ctrl;
          this.mapContainer = mapContainer;
          this.createMap();

          this.circles = [];
        }

        _createClass(WorldMap, [{
          key: 'createMap',
          value: function createMap() {
            var mapCenter = window.L.latLng(parseFloat(this.ctrl.panel.mapCenterLatitude), parseFloat(this.ctrl.panel.mapCenterLongitude));
            this.map = window.L.map(this.mapContainer, { worldCopyJump: true, center: mapCenter, scrollWheelZoom: false }).fitWorld().zoomIn(parseInt(this.ctrl.panel.initialZoom, 10));
            this.map.panTo(mapCenter);

            var tileServerUrl = this.ctrl.panel.tileServerUrl;
            var attribution = this.ctrl.panel.tileServerAttribution;
            var subdomains = this.ctrl.panel.tileServerSubdomains;
            window.L.tileLayer(tileServerUrl, {
              maxZoom: 18,
              reuseTiles: true,
              detectRetina: true,
              subdomains: subdomains,
              attribution: attribution
            }).addTo(this.map);

            window.L.control.mousePosition({
              position: "topright",
              separator: "   ",
              lngFormatter: function lngFormatter(lng) {
                return "Lon: " + lng.toFixed(5);
              },
              latFormatter: function latFormatter(lat) {
                return "Lat: " + lat.toFixed(5);
              }
            }).addTo(this.map); // add mouse coordinate display
          }
        }, {
          key: 'drawTrack',
          value: function drawTrack() {
            //console.log('drawTrack()');
            var data = this.filterEmptyData(this.ctrl.mapdata);
            this.clearTrack();
            // Keep all track layers in one FeatureGroup
            this.trackLayer = L.featureGroup([]).addTo(this.map);
            if (data.length) {
              this.trackLayer.addLayer(this.createTrackLine(data));
              this.trackLayer.addLayer(this.createLatestMarker(data));
            }
          }
        }, {
          key: 'clearTrack',
          value: function clearTrack() {
            if (this.trackLayer) this.map.removeLayer(this.trackLayer);
          }
        }, {
          key: 'createTrackLine',
          value: function createTrackLine(data) {
            //console.log('createTrackLayer()');
            var linedata = data.map(function (doc) {
              return [doc.lat, doc.lon];
            });
            return L.polyline(linedata, {
              color: '#3d3d5c',
              smoothFactor: 3,
              opacity: 0.75,
              weight: 3
            });
          }
        }, {
          key: 'zoomToTrack',
          value: function zoomToTrack() {
            if (this.trackLayer) {
              this.map.fitBounds(this.trackLayer.getBounds(), { padding: [50, 50] });
            }
          }
        }, {
          key: 'createLatestMarker',
          value: function createLatestMarker(data) {
            var latest = _.last(data);
            var marker = L.marker([latest.lat, latest.lon]);
            var time = new Date(latest.time);
            var timeDisplay = this.ctrl.dashboard.formatDate(time, 'YYYY-MM-DD HH:mm:ss');
            var html = '<div style=\'text-align: center\'"><b>' + timeDisplay + '</b></div>';
            html += '<div style=\'text-align: center\'>Recent location [' + latest.lat.toFixed(2) + ', ' + latest.lon.toFixed(2) + ']</div>';
            marker.bindPopup(html);
            return marker;
          }
        }, {
          key: 'createLegend',
          value: function createLegend() {
            var _this = this;

            this.legend = window.L.control({ position: 'bottomleft' });
            this.legend.onAdd = function () {
              _this.legend._div = window.L.DomUtil.create('div', 'info legend');
              _this.legend.update();
              return _this.legend._div;
            };

            this.legend.update = function () {
              var thresholds = _this.ctrl.data.thresholds;
              var legendHtml = '';
              legendHtml += '<i style="background:' + _this.ctrl.panel.colors[0] + '"></i> ' + '&lt; ' + thresholds[0] + '<br>';
              for (var index = 0; index < thresholds.length; index += 1) {
                legendHtml += '<i style="background:' + _this.getColor(thresholds[index] + 1) + '"></i> ' + thresholds[index] + (thresholds[index + 1] ? '&ndash;' + thresholds[index + 1] + '<br>' : '+');
              }
              _this.legend._div.innerHTML = legendHtml;
            };
            this.legend.addTo(this.map);
          }
        }, {
          key: 'needToRedrawCircles',
          value: function needToRedrawCircles(data) {
            if (this.circles.length === 0 && data.length > 0) return true;

            if (this.circles.length !== data.length) return true;
            var locations = _.map(_.map(this.circles, 'options'), 'location').sort();
            var dataPoints = _.map(data, 'key').sort();
            return !_.isEqual(locations, dataPoints);
          }
        }, {
          key: 'filterEmptyData',
          value: function filterEmptyData(data) {
            return _.filter(data, function (o) {
              return _.isFinite(o.lat) && _.isFinite(o.lat);
            });
          }
        }, {
          key: 'clearCircles',
          value: function clearCircles() {
            if (this.circlesLayer) {
              this.circlesLayer.clearLayers();
              this.removeCircles(this.circlesLayer);
              this.circles = [];
            }
          }
        }, {
          key: 'drawCircles',
          value: function drawCircles() {
            var data = this.filterEmptyAndZeroValues(this.ctrl.data);
            if (this.needToRedrawCircles(data)) {
              this.clearCircles();
              this.createCircles(data);
            } else {
              this.updateCircles(data);
            }
          }
        }, {
          key: 'createCircles',
          value: function createCircles(data) {
            var _this2 = this;

            var circles = [];
            data.forEach(function (dataPoint) {
              if (!dataPoint.locationName) return;
              circles.push(_this2.createCircle(dataPoint));
            });
            this.circlesLayer = this.addCircles(circles);
            this.circles = circles;
          }
        }, {
          key: 'updateCircles',
          value: function updateCircles(data) {
            var _this3 = this;

            data.forEach(function (dataPoint) {
              if (!dataPoint.locationName) return;

              var circle = _.find(_this3.circles, function (cir) {
                return cir.options.location === dataPoint.key;
              });

              if (circle) {
                circle.setRadius(_this3.calcCircleSize(dataPoint.value || 0));
                circle.setStyle({
                  color: _this3.getColor(dataPoint.value),
                  fillColor: _this3.getColor(dataPoint.value),
                  fillOpacity: 0.5,
                  location: dataPoint.key
                });
                circle.unbindPopup();
                _this3.createPopup(circle, dataPoint.locationName, dataPoint.valueRounded);
              }
            });
          }
        }, {
          key: 'createCircle',
          value: function createCircle(dataPoint) {
            var circle = window.L.circleMarker([dataPoint.locationLatitude, dataPoint.locationLongitude], {
              radius: this.calcCircleSize(dataPoint.value || 0),
              color: this.getColor(dataPoint.value),
              fillColor: this.getColor(dataPoint.value),
              fillOpacity: 0.5,
              location: dataPoint.key
            });

            this.createPopup(circle, dataPoint.locationName, dataPoint.valueRounded);
            return circle;
          }
        }, {
          key: 'calcCircleSize',
          value: function calcCircleSize(dataPointValue) {
            var circleMinSize = parseInt(this.ctrl.panel.circleMinSize, 10) || 2;
            var circleMaxSize = parseInt(this.ctrl.panel.circleMaxSize, 10) || 30;

            if (this.ctrl.data.valueRange === 0) {
              return circleMaxSize;
            }

            var dataFactor = (dataPointValue - this.ctrl.data.lowestValue) / this.ctrl.data.valueRange;
            var circleSizeRange = circleMaxSize - circleMinSize;

            return circleSizeRange * dataFactor + circleMinSize;
          }
        }, {
          key: 'createPopup',
          value: function createPopup(circle, locationName, value) {
            var unit = value && value === 1 ? this.ctrl.panel.unitSingular : this.ctrl.panel.unitPlural;
            var label = (locationName + ': ' + value + ' ' + (unit || '')).trim();
            circle.bindPopup(label, { 'offset': window.L.point(0, -2), 'className': 'worldmap-popup', 'closeButton': this.ctrl.panel.stickyLabels });

            circle.on('mouseover', function onMouseOver(evt) {
              var layer = evt.target;
              layer.bringToFront();
              this.openPopup();
            });

            if (!this.ctrl.panel.stickyLabels) {
              circle.on('mouseout', function onMouseOut() {
                circle.closePopup();
              });
            }
          }
        }, {
          key: 'getColor',
          value: function getColor(value) {
            for (var index = this.ctrl.data.thresholds.length; index > 0; index -= 1) {
              if (value >= this.ctrl.data.thresholds[index - 1]) {
                return this.ctrl.panel.colors[index];
              }
            }
            return _.first(this.ctrl.panel.colors);
          }
        }, {
          key: 'resize',
          value: function resize() {
            this.map.invalidateSize();
          }
        }, {
          key: 'panToMapCenter',
          value: function panToMapCenter() {
            this.map.panTo([parseFloat(this.ctrl.panel.mapCenterLatitude), parseFloat(this.ctrl.panel.mapCenterLongitude)]);
            this.ctrl.mapCenterMoved = false;
          }
        }, {
          key: 'removeLegend',
          value: function removeLegend() {
            this.legend.removeFrom(this.map);
            this.legend = null;
          }
        }, {
          key: 'addCircles',
          value: function addCircles(circles) {
            return window.L.layerGroup(circles).addTo(this.map);
          }
        }, {
          key: 'removeCircles',
          value: function removeCircles() {
            this.map.removeLayer(this.circlesLayer);
          }
        }, {
          key: 'setZoom',
          value: function setZoom(zoomFactor) {
            this.map.setZoom(parseInt(zoomFactor, 10));
          }
        }, {
          key: 'remove',
          value: function remove() {
            this.circles = [];
            if (this.circlesLayer) this.removeCircles();
            if (this.legend) this.removeLegend();
            this.map.remove();
          }
        }]);

        return WorldMap;
      }();

      _export('default', WorldMap);
    }
  };
});
//# sourceMappingURL=worldmap.js.map
