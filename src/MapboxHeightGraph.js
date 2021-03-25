import "mapbox-gl"
import {HeightGraph} from "./heightgraph";

// todonow: accept options
const options = {
    position: "bottomright",
    width: 800,
    height: 280,
    margins: {
        top: 10,
        right: 30,
        bottom: 55,
        left: 50
    },
    mappings: undefined,
    expand: true,
    expandControls: true,
    translation: {},
    expandCallback: undefined,
    chooseSelectionCallback: undefined,
    selectedAttributeIdx: 0,
    xTicks: undefined,
    yTicks: undefined,
    highlightStyle: undefined,
    graphStyle: undefined,
}

export class MapboxHeightGraph {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'heightgraph mapboxgl-ctrl';
        const self = this;
        const callbacks = {
            // todonow: this vs. self, same in leaflet version
            _showMapMarker: self._showMapMarker.bind(this),
            _fitMapBounds: self._fitMapBounds.bind(this),
            _markSegmentsOnMap: self._markSegmentsOnMap.bind(this)
        }
        this._heightgraph = new HeightGraph(this._container, options, callbacks);
        return this._container;
    }

    onRemove() {
        this._markSegmentsOnMap([]);
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
        this._heightgraph = undefined;
    }

    addData(data) {
        this._heightgraph.addData(data);
    }

    _fitMapBounds(bounds) {
        // todonow: incoming bounds should not be leaflet-specific
        bounds = new mapboxgl.LngLatBounds(bounds._southWest, bounds._northEast);
        this._map.fitBounds(bounds, {
            animate: false
        });
    }

    /**
     * Creates a marker on the map while hovering
     * @param {Object} ll: actual coordinates of the route
     * @param {Number} height: height as float
     * @param {string} type: type of element
     * // todonow: duplicate docs (see leaflet version)
     */
    _showMapMarker(ll, height, type) {
        if (this._popup) {
            this._popup.remove();
            // this._svg.remove();
        }
        if (ll) {
            // todonow: adjust and use drawRouteMarker method (draw popup using svg instead of using default popup?)
            // this._svg = document.createElement('svg');
            // this._heightgraph._drawRouteMarker(this._svg, layerPoint, height, type);
            this._popup = new mapboxgl.Popup({
                closeButton: false,
            })
                /// todonow: make ll independent of leaflet?
                .setLngLat({lon: ll.lng, lat: ll.lat})
                // .setDOMContent(svg)
                .setHTML(`<p>${height}m</p><p></p>${type}</p>`)
                .setMaxWidth("300px")
                .addTo(this._map);
        }
    }

    _markSegmentsOnMap(coords) {
        const id = 'highlighted-segments';
        if (coords.length === 0) {
            if (this._map.getLayer(id))
                this._map.removeLayer(id);
            if (this._map.getSource(id))
                this._map.removeSource(id);
            return;
        }
        // todonow: change format in core
        coords = coords.map(c => c.map(p => [p.lng, p.lat]));
        const data = {
            "type": "Feature",
            "geometry": {
                "type": "MultiLineString",
                "coordinates": coords
            }
        };
        if (!this._map.getSource(id)) {
            this._map.addSource(id, {
                'type': 'geojson',
                'data': data
            });
            this._map.addLayer({
                'id': id,
                'type': 'line',
                'source': id,
                // todonow: use highlightStyle option
                'paint': {
                    'line-color': 'red',
                    'line-width': 4
                }
            });
        } else {
            this._map.getSource(id).setData(data);
        }
    }

}