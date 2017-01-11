var version = '0.5.2';

// define access token
mapboxgl.accessToken = 'pk.eyJ1IjoicGZydWgiLCJhIjoiY2l4aG1oODhkMDAwdTJ6bzIzM3A0eG5qOSJ9.0YfW_nJrhdJNLIFPXypZgw';

//create map
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/pfruh/cixswel7n001u2ro5tm5e4hco',
    center: [6.960347, 50.937599],
    zoom: 12,
    minZoom: 12,
    maxBounds: [[6.742486, 50.839562], [7.197363, 51.096117]]
});

map.getCanvas().style.cursor = 'default';

// define layer names
var namings = {
    "bahn-75": "Bahn - DB",
    "bahn-70": "Bahn - DB",
    "bahn-65": "Bahn - DB",
    "bahn-60": "Bahn - DB",
    "bahn-55": "Bahn - DB",
    "bahn-kvb-hgk-75": "Bahn - KVB & HGK",
    "bahn-kvb-hgk-70": "Bahn - KVB & HGK",
    "bahn-kvb-hgk-65": "Bahn - KVB & HGK",
    "bahn-kvb-hgk-60": "Bahn - KVB & HGK",
    "bahn-kvb-hgk-55": "Bahn - KVB & HGK",
    "industrie-hafen-75": "Industrie & Häfen",
    "industrie-hafen-70": "Industrie & Häfen",
    "industrie-hafen-65": "Industrie & Häfen",
    "industrie-hafen-60": "Industrie & Häfen",
    "industrie-hafen-55": "Industrie & Häfen",
    "strasse-75": "Straße",
    "strasse-70": "Straße",
    "strasse-65": "Straße",
    "strasse-60": "Straße",
    "strasse-55": "Straße",
    "gruen": "Grünfläche"
};
var layers = Object.keys(namings);
var legendLayers = ['bahn-75', 'bahn-kvb-hgk-75', 'industrie-hafen-75', 'strasse-75', 'gruen'];

var ctx = document.getElementById("piechart");
var pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ["DB", "KVB & HGK", "Industrie & Häfen", "Straße", "Lärmfrei"],
        datasets: [{
            data: [10, 10, 10, 10, 10],
            backgroundColor: [
                'rgba(208, 18, 30, 0.2)',
                'rgba(247, 167, 35, 0.2)',
                'rgba(28, 118, 166, 0.2)',
                'rgba(87, 87, 86, 0.2)',
                'rgba(0, 255, 0, 0.2)'
            ],
            borderColor: [
                'rgba(208, 18, 30, 1)',
                'rgba(247, 167, 35, 1)',
                'rgba(28, 118, 166, 1)',
                'rgba(87, 87, 86, 1)',
                'rgba(0, 255, 0, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Verteilung des Lärms'
        }
    }
});

// wait for map to load before adjusting it
map.on('load', function () {
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');
    map.addControl(new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
    }));

    var attrib = document.getElementsByClassName("mapboxgl-ctrl-attrib")[0];

    attrib.innerHTML = 'v' + version + ' ' + attrib.innerHTML;

    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': {
                'type': 'identity',
                'property': 'height'
            },
            'fill-extrusion-base': {
                'type': 'identity',
                'property': 'min_height'
            },
            'fill-extrusion-opacity': .6
        }
    });

    // create legend
    legendLayers.forEach(function (layer) {
        var color = map.getPaintProperty(layer, 'fill-color');
        var item = document.createElement('div');
        var key = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = color;

        var value = document.createElement('span');
        value.innerHTML = namings[layer];
        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item);
    });

    // change stuff on hover over layer
    map.on('mousemove', function (e) {
        var regions = map.queryRenderedFeatures(e.point, {
            layers: layers
        });

        var hasGreen = false;

        if (regions.length > 0) {
            document.getElementById('pd').innerHTML = "";
            regions.forEach(function (region) {
                if (region.layer.id == 'gruen') {
                    // Grünfläche
                    document.getElementById('pd').innerHTML += "<h3><strong>" + namings[region.layer.id] + "</strong></h3><p><em>" + region.properties.Name + "</em></p><p><em>Größe: <strong>" + parseFloat(turf.area(region) / 10000).toFixed(2) + " Hektar</strong></em></p>";
                    if (!hasGreen) {
                        hasGreen = true;
                        currentGreenRegion = region;
                        currentPoint = e.point;
                    }
                } else {
                    // Keine Grünfläche
                    document.getElementById('pd').innerHTML += "<h3><strong>" + namings[region.layer.id] + "</strong></h3><p><em>" + region.properties.TEXT + "</em></p>";
                }
            });
        } else {
            document.getElementById('pd').innerHTML = '<p>Please hover over a region!</p>';
        }

        if (hasGreen) {
            document.getElementById('piechart').style.visibility = "visible";
        } else {
            document.getElementById('piechart').style.visibility = "hidden";
            currentGreenRegion = undefined;
            currentPoint = undefined;
        }
    });

});

var currentGreenRegion;
var currentPoint;
updateChart();
function updateChart() {
    if (!(currentGreenRegion != undefined && currentPoint != undefined)) {
        setTimeout(updateChart, 100);
        return;
    }

    pieChart.data.datasets[0].data[0] = 0;
    pieChart.data.datasets[0].data[1] = 0;
    pieChart.data.datasets[0].data[2] = 0;
    pieChart.data.datasets[0].data[3] = 0;
    pieChart.data.datasets[0].data[4] = 0;

    var clone = layers.slice(0);
    clone.pop();

    var greenSize = turf.area(currentGreenRegion);

    /*
     var regionsToCheck = map.queryRenderedFeatures({
     layers: clone
     });
     */

    //TODO: better calculate size to check for
    //too big = lag, too small = missing layers
    var width = map.getZoom() * 15;
    var height = map.getZoom() * 15;
    var regionsToCheck = map.queryRenderedFeatures([
        [currentPoint.x - width / 2, currentPoint.y - height / 2],
        [currentPoint.x + width / 2, currentPoint.y + height / 2]
    ], {
        layers: clone
    });

    regionsToCheck.forEach(function (region) {
        var intersection = turf.intersect(currentGreenRegion, region);

        if (intersection != undefined) {
            if (region.layer.id.includes('bahn-kvb-hgk'))
                pieChart.data.datasets[0].data[1] += turf.area(intersection) * 100 / greenSize;
            else if (region.layer.id.includes('bahn'))
                pieChart.data.datasets[0].data[0] += turf.area(intersection) * 100 / greenSize;
            else if (region.layer.id.includes('industrie-hafen'))
                pieChart.data.datasets[0].data[2] += turf.area(intersection) * 100 / greenSize;
            else if (region.layer.id.includes('strasse'))
                pieChart.data.datasets[0].data[3] += turf.area(intersection) * 100 / greenSize;
        }
    });

    pieChart.data.datasets[0].data[4] = 100 - pieChart.data.datasets[0].data[3] - pieChart.data.datasets[0].data[2] - pieChart.data.datasets[0].data[1] - pieChart.data.datasets[0].data[0];

    console.log(pieChart.data.datasets[0].data);

    pieChart.update();

    setTimeout(updateChart, 500);
}