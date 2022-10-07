import {MapboxHeightGraph} from "./MapboxHeightGraph";

document.querySelector('#data1').addEventListener('click', e => changeData(1));
document.querySelector('#data2').addEventListener('click', e => changeData(2));
document.querySelector('#data3').addEventListener('click', e => changeData(3))
document.querySelector('#data4').addEventListener('click', e => changeData(4));

export const changeData = setNumber => {
    const dataSet = [geojson1, geojson2, geojson3, []][setNumber-1];
    drawGeoJson(dataSet);
    hg.setData(dataSet);
    hg._fitMapBounds(hg._heightgraph.getBounds());
}

const map = new mapboxgl.Map({
    container: 'map',
    style: {
        'version': 8,
        'sources': {
            'raster-tiles': {
                'type': 'raster',
                'tiles': [
                    'https://a.tile.openstreetmap.de/{z}/{x}/{y}.png',
                    'https://b.tile.openstreetmap.de/{z}/{x}/{y}.png',
                    'https://c.tile.openstreetmap.de/{z}/{x}/{y}.png'
                ],
                'tileSize': 256,
                'attribution': "Map data © <a href=\"https://openstreetmap.org\">OpenStreetMap</a> contributors"
            }
        },
        'layers': [
            {
                'id': 'osm',
                'type': 'raster',
                'source': 'raster-tiles',
            }
        ]
    },
    center: [8.108683, 47.32],
    zoom: 15
});

const hg = new MapboxHeightGraph({
   expand: true
});
map.addControl(hg, 'bottom-right');
hg.setData(geojson1)

const layers = [];
const drawGeoJson = (geojson) => {
    for (let i = 0; i < geojson.length; i++) {
        const id = 'route-' + i
        layers.forEach(l => {
            if (map.getLayer(l))
                map.removeLayer(l);
            if (map.getSource(l))
                map.removeSource(l);
        });
        map.addSource(id, {
            'type': 'geojson',
            'data': geojson[i]
        })
        map.addLayer({
            'id': id,
            'type': 'line',
            'source': id,
            'paint': {
                'line-color': 'green',
                'line-width': 4
            }
        })
        layers.push(id);
    }
}
map.on('load', function () {
    drawGeoJson(geojson1);
});
const bounds = new mapboxgl.LngLatBounds(new mapboxgl.LngLat(8.108683, 47.323989), new mapboxgl.LngLat(8.029803, 46.96485))
map.fitBounds(bounds, {
    animate: false
});

hg.resize({width: 1000, height: 300})