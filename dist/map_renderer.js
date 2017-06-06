'use strict';

System.register(['./external/leaflet/leaflet.css!', './external/leaflet/L.Control.MousePosition.css!', './worldmap'], function (_export, _context) {
  "use strict";

  var WorldMap;
  function link(scope, elem, attrs, ctrl) {
    var mapContainer = elem.find('.mapcontainer');

    ctrl.events.on('render', function () {
      //console.log('map render');
      render();
      ctrl.renderingCompleted();
    });

    function render() {
      //console.log('map render');
      //if (!ctrl.mapdata || ctrl.mapdata.length === 0) return;

      if (!ctrl.map) {
        // Clear any old leaflet map in map container div
        $(mapContainer[0]).empty();
        // New map!
        ctrl.map = new WorldMap(ctrl, mapContainer[0]);
      }

      ctrl.map.resize();

      //if (ctrl.mapCenterMoved) ctrl.map.panToMapCenter();

      ctrl.map.drawTrack();
      // Bit of a hack, immediately zooming only works intermittently
      setTimeout(ctrl.map.zoomToTrack.bind(ctrl.map), 1000);
    }
  }

  _export('default', link);

  return {
    setters: [function (_externalLeafletLeafletCss) {}, function (_externalLeafletLControlMousePositionCss) {}, function (_worldmap) {
      WorldMap = _worldmap.default;
    }],
    execute: function () {}
  };
});
//# sourceMappingURL=map_renderer.js.map
