import {HeightGraph} from "../src/heightgraph"

const map = document.createElement('div');
const hg = new HeightGraph(map);
hg.setData({
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": []
            },
            "properties": {
                "attributeType": "elevation"
            }
        }
    ],
    "properties": {
        "summary": "Elevation [m]",
        "records": 1
    }
});