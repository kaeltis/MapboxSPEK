// define access token
mapboxgl.accessToken = 'pk.eyJ1IjoicGZydWgiLCJhIjoiY2l4aG1oODhkMDAwdTJ6bzIzM3A0eG5qOSJ9.0YfW_nJrhdJNLIFPXypZgw';

//create map
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/pfruh/cixswel7n001u2ro5tm5e4hco', // map style URL from Mapbox Studio
    center: [6.960347, 50.937599],
    zoom: 12,
    minZoom: 12,
    maxBounds: [[6.742486, 50.839562], [7.197363, 51.096117]]
});

map.getCanvas().style.cursor = 'default';

var ctx = document.getElementById("piechart");
var myChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ["DB", "KVB & HGK", "Industrie & Häfen", "Straße"],
        datasets: [{
            label: '% des Lärms',
            data: [10, 10, 10, 10],
            backgroundColor: [
                'rgba(208, 18, 30, 0.2)',
                'rgba(247, 167, 35, 0.2)',
                'rgba(28, 118, 166, 0.2)',
                'rgba(87, 87, 86, 0.2)'
            ],
            borderColor: [
                'rgba(208, 18, 30, 1)',
                'rgba(247, 167, 35, 1)',
                'rgba(28, 118, 166, 1)',
                'rgba(87, 87, 86, 1)'
            ],
            borderWidth: 1
        }]
    }
});

// wait for map to load before adjusting it
map.on('load', function () {

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

    // change info window on hover
    map.on('mousemove', function (e) {
        var regions = map.queryRenderedFeatures(e.point, {
            layers: layers
        });

        if (regions.length > 0) {
            document.getElementById('pd').innerHTML = "";
            regions.forEach(function (region) {
                if (region.properties.Name != undefined) {
                    // Grünfläche
                    document.getElementById('pd').innerHTML += "<h3><strong>" + namings[region.layer.id] + "</strong></h3><p><em>" + region.properties.Name + "</em></p><p><em>Größe: <strong>" + parseFloat(turf.area(region) / 10000).toFixed(2) + " Hektar</strong></em></p>";
                } else {
                    // Keine Grünfläche
                    document.getElementById('pd').innerHTML += "<h3><strong>" + namings[region.layer.id] + "</strong></h3><p><em>" + region.properties.TEXT + "</em></p>";
                }
            });
        } else {
            document.getElementById('pd').innerHTML = '<p>Please hover over a region!</p>';
        }
    });

});