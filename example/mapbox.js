import {MapboxHeightGraph} from "../src/MapboxHeightGraph";

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
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [8.108683, 47.32],
    zoom: 15
});

const heightgraph = new MapboxHeightGraph();
map.addControl(heightgraph, 'bottom-right');
heightgraph.addData(geojson1)

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