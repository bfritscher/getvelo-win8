(function () {
    "use strict";

    var list = new WinJS.Binding.List();
    var sortedList = list.createSorted(sortStations);
    var groupedItems = list.createGrouped(
        function groupKeySelector(station) { return station.network.name + '*' + station.network.id; },
        function groupDataSelector(station) { return station.network; }
    );

    function sortStations(a, b) {
        var s = a.network.name.localeCompare(b.network.name);
        if (s === 0) {
            if(a.city && b.city){
                s = a.city.localeCompare(b.city);
            }
            if (s === 0) {
                s = a.name.localeCompare(b.name);
            }
        }
        return s;
    }

    loadNetworks();
    function loadNetworks() {
        var requestStr = "http://192.168.100.40/velopass.php";
        WinJS.xhr({ url: requestStr }).then(
            //Callback for success
            function (request) {
                var networks = JSON.parse(request.responseText);
                // Verify if the service has returned
                if (networks !== undefined) {
                    networks.forEach(function (network){
                        network.stations.forEach(function (station) {
                            station.network = network;
                            list.push(station);
                        });
                    });
                    list.sort(sortStations);
                } else {
                    WinJS.log && WinJS.log("Error fetching results", "sample", "error");
                }
            },
            // Called if the XHR fails
             function (request) {
                 if (request.status === 401) {
                     WinJS.log && WinJS.log(request.statusText, "sample", "error");
                 } else {
                     WinJS.log && WinJS.log("Error fetching data from the service. " + request.responseText, "sample", "error");
                 }
             });
    }


    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference
    });

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.network.id, item.id];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) { return item.network.id === group.id; });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).id === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.network.id === reference[0] && item.id === reference[1]) {
                return item;
            }
        }
    }


})();
