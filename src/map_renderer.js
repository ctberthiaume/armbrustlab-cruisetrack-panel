import './external/leaflet/leaflet.css!';
import './external/leaflet/L.Control.MousePosition.css!';
import WorldMap from './worldmap';

export default function link(scope, elem, attrs, ctrl) {
  const mapContainer = elem.find('.mapcontainer');

  ctrl.events.on('render', () => {
    //console.log('map render');
    render();
    ctrl.renderingCompleted();
  });

  function render() {
    //console.log('map render');
    //if (!ctrl.mapdata || ctrl.mapdata.length === 0) return;

    if (!ctrl.map) {
      ctrl.map = new WorldMap(ctrl, mapContainer[0]);
    }

    ctrl.map.resize();

    //if (ctrl.mapCenterMoved) ctrl.map.panToMapCenter();

    ctrl.map.drawTrack();
    ctrl.map.zoomToTrack();
  }
}
