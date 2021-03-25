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
                _removeMarkedSegmentsOnMap: self._removeMarkedSegmentsOnMap.bind(this),
                _markSegmentsOnMap: self._markSegmentsOnMap.bind(this)
            }
            this._heightgraph = new HeightGraph(this._container, this.options, callbacks);
            return this._container;
        },
        onRemove(map) {
            this._removeMarkedSegmentsOnMap();
            this._heightgraph = null;
            this._container = null;
        },
        /**
         * add Data from geoJson and call all functions
         * @param {Object} data
         */
        addData(data) {
            this._removeMarkedSegmentsOnMap();
            this._heightgraph.addData(data)
        },
        resize(size) {
            this._heightgraph.resize(size);
        },
        _fitMapBounds(bounds) {
            this._map.fitBounds(bounds);
        },
        /**
         * Creates a marker on the map while hovering
         * @param {Object} ll: actual coordinates of the route
         * @param {Number} height: height as float
         * @param {string} type: type of element
         */
        _showMapMarker(ll, height, type) {
            const layerPoint = this._map.latLngToLayerPoint(ll)
            const svg = document.querySelector(".leaflet-overlay-pane svg");
            this._heightgraph._drawRouteMarker(svg, layerPoint, height, type);
        },
        /**
         * Highlights segments on the map above given elevation value
         */
        _markSegmentsOnMap(coords) {
            if (coords) {
                if (coords.length > 1) {
                    // some other leaflet plugins can't deal with multi-Polylines very well
                    // therefore multiple single polylines are used here
                    this._markedSegments = L.featureGroup()
                    for (let linePart of coords) {
                        L.polyline(
                            linePart,
                            { ...this._highlightStyle, ...{ interactive: false } }
                        ).addTo(this._markedSegments)
                    }
                    this._markedSegments.addTo(this._map)
                        .bringToFront()
                } else {
                    this._markedSegments = L.polyline(coords, this._highlightStyle).addTo(this._map);
                }
            }
        },
        /**
         * Remove the highlighted segments from the map
         */
        _removeMarkedSegmentsOnMap() {
            if (this._markedSegments !== undefined) {
                this._map.removeLayer(this._markedSegments);
            }
        },

        /*
         * Handles the mouseout event and clears the current point info.
         * @param {int} delay - time before markers are removed in milliseconds
         */
        mapMouseoutHandler(delay = 1000) {
            if (this.mouseoutDelay) {
                window.clearTimeout(this.mouseoutDelay)
            }
            this.mouseoutDelay = window.setTimeout(() => {
                this._heightgraph._mouseoutHandler();
            }, delay)
        },
        /*
         * Handles the mouseover the map and displays distance and altitude level.
         * Since this does a lookup of the point on the graph
         * the closest to the given latlng on the provided event, it could be slow.
         */
        mapMousemoveHandler(event, { showMapMarker: showMapMarker = true } = {}) {
            // todonow
            if (this._heightgraph._areasFlattended === false) {
                return;
            }
            // initialize the vars for the closest item calculation
            let closestItem = null;
            // large enough to be trumped by any point on the chart
            let closestDistance = 2 * Math.pow(100, 2);
            // consider a good enough match if the given point (lat and lng) is within
            // 1.1 meters of a point on the chart (there are 111,111 meters in a degree)
            const exactMatchRounding = 1.1 / 111111;
            // todonow
            for (let item of this._heightgraph._areasFlattended) {
                let latDiff = event.latlng.lat - item.latlng.lat;
                let lngDiff = event.latlng.lng - item.latlng.lng;
                // first check for an almost exact match; it's simple and avoid further calculations
                if (Math.abs(latDiff) < exactMatchRounding && Math.abs(lngDiff) < exactMatchRounding) {
                    // todonow
                    this._heightgraph._internalMousemoveHandler(item, showMapMarker);
                    break;
                }
                // calculate the squared distance from the current to the given;
                // it's the squared distance, to avoid the expensive square root
                const distance = Math.pow(latDiff, 2) + Math.pow(lngDiff, 2);
                if (distance < closestDistance) {
                    closestItem = item;
                    closestDistance = distance;
                }
            }

            // todonow
            if (closestItem) this._heightgraph._internalMousemoveHandler(closestItem, showMapMarker);
        },

    });
    L.control.heightgraph = function (options) {
        return new L.Control.Heightgraph(options)
    }

    return L.Control.Heightgraph
}, window))
