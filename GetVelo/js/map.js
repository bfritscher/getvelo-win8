(function () {
    "use strict";


    function create(element, stations) {
        Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: initMap });

        function initMap() {
            var map;

            var mapOptions =
            {
                credentials: "Ah1rfbaAkZd991WLxdhTm9qbkcFBu_TFsB8qwP3nsRA5g5FUahTh2LJ7u2cfo6Ct",
                enableClickableLogo: false,
                showDashboard: false,
                //width: 500,
                //height: 300,
                //center: new Microsoft.Maps.Location(stations[0].lat, stations[0].long),
                mapTypeId: Microsoft.Maps.MapTypeId.road,
                zoom: 15
            };

            map = new Microsoft.Maps.Map(element, mapOptions);

            var locs = [];
            stations.forEach(function (station) {
                var loc = new Microsoft.Maps.Location(station.lat, station.long);
                locs.push(loc);
                var pin = new Microsoft.Maps.Pushpin(loc, {
                    icon: '/images/pushpin.png',
                    width: 32, height: 37
                    //anchor: new Microsoft.Maps.Point(8, 8),
                    //text: 'test'
                });
                Microsoft.Maps.Events.addHandler(pin, 'click', function () {
                    WinJS.Navigation.navigate("/pages/itemDetail/itemDetail.html", { item: Data.getItemReference(station) });
                });
                map.entities.push(pin);
            });
            var bestview = Microsoft.Maps.LocationRect.fromLocations(locs);
            if (stations.length > 1) {
                bestview = new Microsoft.Maps.LocationRect(bestview.center, bestview.width + 0.001, bestview.height + 0.001)
            }
            map.setView({ bounds: bestview });
        }
    }

    WinJS.Namespace.define("Map", {
        create: create
    });
})();