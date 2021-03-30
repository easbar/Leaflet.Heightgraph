import {createMapMarker, HeightGraph} from "./heightgraph";
import 'd3-selection-multi'

export class MapboxHeightGraph {

    constructor(options) {
        this._options = options;
    }

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
        this._heightgraph = new HeightGraph(this._container, this._options, callbacks);
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

    resize(size) {
        this._heightgraph.resize(size);
    }

    _fitMapBounds(bounds) {
        bounds = new mapboxgl.LngLatBounds(bounds.sw, bounds.ne);
        this._map.fitBounds(bounds, {
            animate: false
        });
    }

    /**
     * Creates a marker on the map while hovering
     * @param {Object} ll: actual coordinates of the route
     * @param {Number} elevation: elevation as float
     * @param {string} type: type of element
     * // todonow: duplicate docs (see leaflet version)
     */
    _showMapMarker(ll, elevation, description) {
        if (this._marker) {
            this._marker.remove();
            this._marker = undefined;
        }
        if (ll) {
            this._marker = new mapboxgl.Marker({
                element: createMapMarker(elevation, description),
                anchor: 'bottom-left',
                offset: new mapboxgl.Point(-5, 5)
            })
                /// todonow: make ll independent of leaflet?
                .setLngLat({lon: ll.lng, lat: ll.lat})
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