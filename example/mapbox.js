import 'd3-selection-multi'
import {HeightGraph} from "../src/heightgraph";

const changeData = setNumber => {
    let dataSet = setNumber === '1' ? geojson1 : setNumber === '2' ? geojson2 : setNumber === '3' ? geojson3 : []
    drawGeoJson(dataSet);
    // todonow: implement this
    // if (dataSet.length !== 0) {
    //     let newLayer = L.geoJson(dataSet)
    //     newLayer.on({
    //         'mousemove': onRoute,
    //         'mouseout': outRoute,
    //     })
    //     let newBounds = newLayer.getBounds()
    //     displayGroup.addLayer(newLayer)
    //     map.fitBounds(newBounds)
    // }
    // hg.addData(dataSet);
}

mapboxgl.accessToken = 'pk.eyJ1IjoicmFuLWRvbSIsImEiOiJjanRsYnNpbG4wNHBrM3lxdXV2NWVoODluIn0.ji-ZxUwPS_MisOJIUgM1eQ';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [8.108683, 47.32],
    zoom: 15
});

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

class HelloWorldControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'heightgraph mapboxgl-ctrl';
        const self = this;
        const callbacks = {
            // todonow: this vs. self, same in leaflet version
            _showMapMarker: self._showMapMarker.bind(this),
            _fitMapBounds: self._fitMapBounds.bind(this),
            // todonow: draw marked segments (simply draw them on top of the actual route)
            _removeMarkedSegmentsOnMap: () => {
            },
            _markSegmentsOnMap: () => {
            },
        }
        this._heightgraph = new HeightGraph(this._container, options, callbacks);
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
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
        // todonow: adjust and use drawRouteMarker method (draw popup using svg instead of using default popup?)
        // const svg = document.createElement('svg');
        // this._heightgraph._drawRouteMarker(svg, layerPoint, height, type);
        if (this._popup)
            // todonow: popup should also be removed when mouse leaves heightgraph
            this._popup.remove();
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

const hello = new HelloWorldControl();
map.addControl(hello, 'bottom-right');
map.addControl(new mapboxgl.NavigationControl());

hello.addData(geojson1)

const drawGeoJson = (geojson) => {
    for (let i = 0; i < geojson.length; i++) {
        const id = 'route-' + i
        // todonow: what if we change to a smaller/bigger source?
        if (map.getLayer(id))
            map.removeLayer(id);
        if (map.getSource(id))
            map.removeSource(id);

        map.addSource(id, {
            'type': 'geojson',
            'data': geojson[i]
        });
        map.addLayer({
            'id': id,
            'type': 'line',
            'source': id,
            'paint': {
                'line-color': 'green',
                'line-width': 4
            }
        });
    }
}
map.on('load', function () {
    drawGeoJson(geojson1);
});
const bounds = new mapboxgl.LngLatBounds(new mapboxgl.LngLat(8.108683, 47.323989), new mapboxgl.LngLat(8.029803, 46.96485))
map.fitBounds(bounds, {
    animate: false
});