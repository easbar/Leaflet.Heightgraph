import {HeightGraph} from "../src/heightgraph"

const map = document.createElement('div');
document.body.appendChild(map);
const hg = new HeightGraph(map);
hg.setData(geojson1)