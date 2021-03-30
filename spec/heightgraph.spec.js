import {HeightGraph} from "../src/heightgraph";

const testData = () => {
    return [{
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    [8.109849, 47.320243, 453.1],
                    [8.110078, 47.319857, 454.3],
                    [8.11022, 47.319656, 455]
                ]
            },
            properties: {
                attributeType: 0
            }
        }],
        properties: {
            summary: 'test-data',
            records: 1
        }
    }]
}

describe('heightgraph', () => {
    it('has valid elevation bounds when coordinates are empty', () => {
        const container = document.createElement('div')
        const hg = new HeightGraph(container);
        hg.setData(testData());
        // elevation bounds include some margin
        expect(hg._elevationBounds).toEqual({min: 443.1, max: 465});
        const withoutCoords = testData();
        withoutCoords[0].features[0].geometry.coordinates = []
        hg.setData(withoutCoords);
        expect(hg._elevationBounds).toEqual({min: 0, max: 0});
    });
})