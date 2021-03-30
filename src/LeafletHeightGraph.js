import {createMapMarker, HeightGraph} from "./heightgraph";

export const LeafletHeightGraph = L.Control.extend({
    options: {
        position: 'bottomright'
    },
    initialize(_options) {
        L.Util.setOptions(this, _options);
        this._highlightStyle = this.options.highlightStyle || { color: 'red' }
    },
    onAdd(map) {
        this._container = L.DomUtil.create("div", "heightgraph")
        L.DomEvent.disableClickPropagation(this._container);
        const self = this;
        const callbacks = {
            _showMapMarker: self._showMapMarker.bind(this),
            _fitMapBounds: self._fitMapBounds.bind(this),
            _markSegmentsOnMap: self._markSegmentsOnMap.bind(this)
        }
        this._heightgraph = new HeightGraph(this._container, this.options, callbacks);
        return this._container;
    },
    onRemove(map) {
        this._markSegmentsOnMap([]);
        this._heightgraph = null;
        this._container = null;
    },
    /**
     * add Data from geoJson and call all functions
     * @param {Object} data
     */
    addData(data) {
        this._heightgraph.addData(data)
    },
    resize(size) {
        this._heightgraph.resize(size);
    },
    _fitMapBounds(bounds) {
        bounds = L.latLngBounds(bounds.sw, bounds.ne);
        this._map.fitBounds(bounds);
    },
    /**
     * Creates a marker on the map while hovering
     * @param {Object} ll: actual coordinates of the route
     * @param {Number} elevation: height as float
     * @param {string} type: type of element
     */
    _showMapMarker(ll, elevation, type) {
        if (this._marker) {
            this._marker.remove();
            this._marker = undefined;
        }
        if (ll) {
            this._marker = L.marker(ll, {
                icon: L.divIcon({
                    className: 'height-graph-map-marker-div-icon',
                    html: createMapMarker(elevation, type),
                    iconAnchor: [5, 80]
                })
            });
            this._marker.addTo(this._map);
        }
    },
    /**
     * Highlights segments on the map above given elevation value
     */
    _markSegmentsOnMap(coords) {
        if (this._markedSegments !== undefined) {
            this._map.removeLayer(this._markedSegments);
        }
        if (coords.length === 1) {
            this._markedSegments = L.polyline(coords, this._highlightStyle).addTo(this._map);
        } else {
            // some other leaflet plugins can't deal with multi-Polylines very well
            // therefore multiple single polylines are used here
            this._markedSegments = L.featureGroup()
            for (let linePart of coords) {
                L.polyline(
                    linePart,
                    {...this._highlightStyle, ...{interactive: false}}
                ).addTo(this._markedSegments)
            }
            this._markedSegments.addTo(this._map)
                .bringToFront()
        }
    }
});
