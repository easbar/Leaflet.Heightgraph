// todonow: why are there extra handlers for this here?
const onRoute = event => {
    hg.mapMousemoveHandler(event, {showMapMarker:false})
}
const outRoute = event => {
    hg.mapMouseoutHandler(2000)
}
const changeData = setNumber => {
    let dataSet = setNumber === '1' ? geojson1 : setNumber === '2' ? geojson2 : setNumber === '3' ? geojson3 : []
    displayGroup.clearLayers()
    if (dataSet.length !== 0) {
        let newLayer = L.geoJson(dataSet)
        newLayer.on({
            'mousemove': onRoute,
            'mouseout': outRoute,
        })
        let newBounds = newLayer.getBounds()
        displayGroup.addLayer(newLayer)
        map.fitBounds(newBounds)
    }
    hg.addData(dataSet)
}
const map = new L.Map('map')

const url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr = "Map data © <a href=\"https://openstreetmap.org\">OpenStreetMap</a> contributors"

const openstreetmap = L.tileLayer(url, {
    id: "openstreetmap",
    attribution: attr
})

const displayGroup = new L.LayerGroup()
displayGroup.addTo(map)

const bounds = new L.LatLngBounds(new L.LatLng(47.323989, 8.108683), new L.LatLng(46.96485, 8.029803))

const hg = L.control.heightgraph({
    mappings: colorMappings,
    graphStyle: {
        opacity: 0.8,
        'fill-opacity': 0.5,
        'stroke-width': '2px'
    },
    translation: {
        distance: "My custom distance"
    },
    expandCallback(expand) {
        console.log("Expand: "+expand)
    },
    expandControls: true,
    highlightStyle: {
        color: "purple"
    }
})

hg.addTo(map)

hg.addData(geojson1)

L.geoJson(geojson1)
    .on({
        'mousemove': onRoute,
        'mouseout': outRoute,
    })
    .addTo(displayGroup)

// todonow: shouldn't this be part of heightgraph (emit fitMapBounds callback when data is set/added)
map.addLayer(openstreetmap).fitBounds(bounds)

hg.resize({width:1000,height:300})
