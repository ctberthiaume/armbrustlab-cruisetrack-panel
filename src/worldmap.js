/* eslint-disable id-length, no-unused-vars */
import _ from 'lodash';
import L from './external/leaflet/leaflet';
import './external/leaflet/L.Control.MousePosition';

export default class WorldMap {
  constructor(ctrl, mapContainer) {
    this.ctrl = ctrl;
    this.mapContainer = mapContainer;
    this.createMap();

    this.circles = [];
  }

  createMap() {
    const mapCenter = window.L.latLng(parseFloat(this.ctrl.panel.mapCenterLatitude), parseFloat(this.ctrl.panel.mapCenterLongitude));
    this.map = window.L.map(this.mapContainer, {worldCopyJump: true, center: mapCenter, scrollWheelZoom: false})
      .fitWorld()
      .zoomIn(parseInt(this.ctrl.panel.initialZoom, 10));
    this.map.panTo(mapCenter);

    const tileServerUrl = this.ctrl.panel.tileServerUrl;
    const attribution = this.ctrl.panel.tileServerAttribution;
    const subdomains = this.ctrl.panel.tileServerSubdomains;
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
      lngFormatter: function(lng) { return "Lon: " + lng.toFixed(5); },
      latFormatter: function(lat) { return "Lat: " + lat.toFixed(5); }
    }).addTo(this.map);  // add mouse coordinate display
  }

  drawTrack() {
    //console.log('drawTrack()');
    const data = this.filterEmptyData(this.ctrl.mapdata);
    this.clearTrack();
    // Keep all track layers in one FeatureGroup
    this.trackLayer = L.featureGroup([]).addTo(this.map);
    if (data.length) {
      this.trackLayer.addLayer(this.createTrackLine(data));
      this.trackLayer.addLayer(this.createLatestMarker(data));
    }
  }

  clearTrack() {
    if (this.trackLayer) this.map.removeLayer(this.trackLayer);
  }

  createTrackLine(data) {
    //console.log('createTrackLayer()');
    const linedata = data.map(doc => [doc.lat, doc.lon]);
    return L.polyline(linedata, {
      color: '#3d3d5c',
      smoothFactor: 3,
      opacity: 0.75,
      weight: 3
    });
  }

  zoomToTrack() {
    if (this.trackLayer) {
      this.map.fitBounds(this.trackLayer.getBounds(), {padding: [50, 50]});
    }
  }

  createLatestMarker(data) {
    const latest = _.last(data);
    const marker = L.marker([latest.lat, latest.lon]);
    const time = new Date(latest.time);
    const timeDisplay = this.ctrl.dashboard.formatDate(time, 'YYYY-MM-DD HH:mm:ss');
    let html = `<div style='text-align: center'"><b>${timeDisplay}</b></div>`;
    html += `<div style='text-align: center'>Recent location [${latest.lat.toFixed(2)}, ${latest.lon.toFixed(2)}]</div>`;
    marker.bindPopup(html);
    return marker;
  }

  createLegend() {
    this.legend = window.L.control({position: 'bottomleft'});
    this.legend.onAdd = () => {
      this.legend._div = window.L.DomUtil.create('div', 'info legend');
      this.legend.update();
      return this.legend._div;
    };

    this.legend.update = () => {
      const thresholds = this.ctrl.data.thresholds;
      let legendHtml = '';
      legendHtml += '<i style="background:' + this.ctrl.panel.colors[0] + '"></i> ' +
          '&lt; ' + thresholds[0] + '<br>';
      for (let index = 0; index < thresholds.length; index += 1) {
        legendHtml +=
          '<i style="background:' + this.getColor(thresholds[index] + 1) + '"></i> ' +
          thresholds[index] + (thresholds[index + 1] ? '&ndash;' + thresholds[index + 1] + '<br>' : '+');
      }
      this.legend._div.innerHTML = legendHtml;
    };
    this.legend.addTo(this.map);
  }

  needToRedrawCircles(data) {
    if (this.circles.length === 0 && data.length > 0) return true;

    if (this.circles.length !== data.length) return true;
    const locations = _.map(_.map(this.circles, 'options'), 'location').sort();
    const dataPoints = _.map(data, 'key').sort();
    return !_.isEqual(locations, dataPoints);
  }

  filterEmptyData(data) {
    return _.filter(data, (o) => _.isFinite(o.lat) && _.isFinite(o.lat));
  }

  clearCircles() {
    if (this.circlesLayer) {
      this.circlesLayer.clearLayers();
      this.removeCircles(this.circlesLayer);
      this.circles = [];
    }
  }

  drawCircles() {
    const data = this.filterEmptyAndZeroValues(this.ctrl.data);
    if (this.needToRedrawCircles(data)) {
      this.clearCircles();
      this.createCircles(data);
    } else {
      this.updateCircles(data);
    }
  }

  createCircles(data) {
    const circles = [];
    data.forEach((dataPoint) => {
      if (!dataPoint.locationName) return;
      circles.push(this.createCircle(dataPoint));
    });
    this.circlesLayer = this.addCircles(circles);
    this.circles = circles;
  }

  updateCircles(data) {
    data.forEach((dataPoint) => {
      if (!dataPoint.locationName) return;

      const circle = _.find(this.circles, (cir) => { return cir.options.location === dataPoint.key; });

      if (circle) {
        circle.setRadius(this.calcCircleSize(dataPoint.value || 0));
        circle.setStyle({
          color: this.getColor(dataPoint.value),
          fillColor: this.getColor(dataPoint.value),
          fillOpacity: 0.5,
          location: dataPoint.key,
        });
        circle.unbindPopup();
        this.createPopup(circle, dataPoint.locationName, dataPoint.valueRounded);
      }
    });
  }

  createCircle(dataPoint) {
    const circle = window.L.circleMarker([dataPoint.locationLatitude, dataPoint.locationLongitude], {
      radius: this.calcCircleSize(dataPoint.value || 0),
      color: this.getColor(dataPoint.value),
      fillColor: this.getColor(dataPoint.value),
      fillOpacity: 0.5,
      location: dataPoint.key
    });

    this.createPopup(circle, dataPoint.locationName, dataPoint.valueRounded);
    return circle;
  }

  calcCircleSize(dataPointValue) {
    const circleMinSize = parseInt(this.ctrl.panel.circleMinSize, 10) || 2;
    const circleMaxSize = parseInt(this.ctrl.panel.circleMaxSize, 10) || 30;

    if (this.ctrl.data.valueRange === 0) {
      return circleMaxSize;
    }

    const dataFactor = (dataPointValue - this.ctrl.data.lowestValue) / this.ctrl.data.valueRange;
    const circleSizeRange = circleMaxSize - circleMinSize;

    return (circleSizeRange * dataFactor) + circleMinSize;
  }

  createPopup(circle, locationName, value) {
    const unit = value && value === 1 ? this.ctrl.panel.unitSingular : this.ctrl.panel.unitPlural;
    const label = (locationName + ': ' + value + ' ' + (unit || '')).trim();
    circle.bindPopup(label, {'offset': window.L.point(0, -2), 'className': 'worldmap-popup', 'closeButton': this.ctrl.panel.stickyLabels});

    circle.on('mouseover', function onMouseOver(evt) {
      const layer = evt.target;
      layer.bringToFront();
      this.openPopup();
    });

    if (!this.ctrl.panel.stickyLabels) {
      circle.on('mouseout', function onMouseOut() {
        circle.closePopup();
      });
    }
  }

  getColor(value) {
    for (let index = this.ctrl.data.thresholds.length; index > 0; index -= 1) {
      if (value >= this.ctrl.data.thresholds[index - 1]) {
        return this.ctrl.panel.colors[index];
      }
    }
    return _.first(this.ctrl.panel.colors);
  }

  resize() {
    this.map.invalidateSize();
  }

  panToMapCenter() {
    this.map.panTo([parseFloat(this.ctrl.panel.mapCenterLatitude), parseFloat(this.ctrl.panel.mapCenterLongitude)]);
    this.ctrl.mapCenterMoved = false;
  }

  removeLegend() {
    this.legend.removeFrom(this.map);
    this.legend = null;
  }

  addCircles(circles) {
    return window.L.layerGroup(circles).addTo(this.map);
  }

  removeCircles() {
    this.map.removeLayer(this.circlesLayer);
  }

  setZoom(zoomFactor) {
    this.map.setZoom(parseInt(zoomFactor, 10));
  }

  remove() {
    this.circles = [];
    if (this.circlesLayer) this.removeCircles();
    if (this.legend) this.removeLegend();
    this.map.remove();
  }
}
