import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import $ from 'jquery';
import TimeSeries from 'app/core/time_series2';
import mapRenderer from './map_renderer';

const panelDefaults = {
  mapCenterLatitude: 0,
  mapCenterLongitude: 0,
  initialZoom: 1,
  tileServerUrl: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
  tileServerAttribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  tileServerSubdomains: 'abcd'
};

export class CruiseTrackPanelCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaults(this.panel, panelDefaults);
    this.series = [];
    this.mapdata = [];
    this.debouncedChange = _.debounce(() => {
      if (this.map) {
        // erase map
        this.map.remove();
        this.map = undefined;
      }
      this.render();
    }, 3000);
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/armbrustlab-cruisetrack-panel/edit.html', 2);
  }

  editChanged() {
    this.debouncedChange();
  }

  onDataError(err) {
    this.onDataReceived([]);
  }

  onDataReceived(dataList) {
    //console.log('map onDataReceived()');
    this.series = dataList.map(this.seriesHandler.bind(this));
    let lats = [], lons = [], mapdata = [];
    this.series.forEach(s => {
      if (s.alias === 'lat' || s.alias === 'latitude') {
        lats = s.datapoints;
      } else if (s.alias === 'lon' || s.alias === 'longitude') {
        lons = s.datapoints;
      }
    });
    if (lats.length && lats.length === lons.length) {
      lats.forEach((lat, i) => {
        mapdata.push({
          lat: lat[0],
          lon: lons[i][0],
          date: lat[1]
        });
      });
      this.mapdata = mapdata;
    }
    this.render();
  }

  seriesHandler(seriesData) {
    const serie = new TimeSeries({
      datapoints: seriesData.datapoints,
      alias: seriesData.target,
    });
    return serie;
  }

  /* eslint class-methods-use-this: 0 */
  link(scope, elem, attrs, ctrl) {
    mapRenderer(scope, elem, attrs, ctrl);
  }
}

CruiseTrackPanelCtrl.templateUrl = 'template.html';
