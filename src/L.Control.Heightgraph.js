import {HeightGraph} from "./heightgraph";
(function (factory, window) {

    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);

        // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === 'object') {
        if (typeof window !== 'undefined' && window.L) {
            module.exports = factory(L);
        } else {
            module.exports = factory(require('leaflet'));
        }
    }

    // attach your plugin to the global 'L' variable
    if (typeof window !== 'undefined' && window.L) {
        window.L.Control.Heightgraph = factory(L);
    }
}(function (L) {
    L.Control.Heightgraph = L.Control.extend({
        // todonow: move defaults into heightgraph
        options: {
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
            graphStyle: undefined
        },
        initialize(_options) {
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
            this._heightgraph._removeRouteMarker();
            if (ll) {
                const layerPoint = this._map.latLngToLayerPoint(ll)
                const svg = document.querySelector(".leaflet-overlay-pane svg");
                this._heightgraph._drawRouteMarker(svg, layerPoint, elevation, type);
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
        },
    });
    L.control.heightgraph = function (options) {
        return new L.Control.Heightgraph(options)
    }

    return L.Control.Heightgraph
}, window))
