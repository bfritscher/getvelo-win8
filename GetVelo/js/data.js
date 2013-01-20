(function () {
    "use strict";

    var list = new WinJS.Binding.List();
    var terms = [];
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

    function addTerm(term) {
        term = term.toLowerCase();
        if (terms.indexOf(term) == -1) {
            terms.push(term);
        }
    }

    function loadNetworks(callback) {
        var requestStr = Helper.apiUrl;
        terms.splice(0, terms.length);
        list.splice(0, list.length);
        WinJS.xhr({ url: requestStr }).then(
            //Callback for success
            function (request) {
                try{
                    var networks = JSON.parse(request.responseText);
                    // Verify if the service has returned
                    networks.forEach(function (network) {
                        addTerm(network.name);
                            network.stations.forEach(function (station) {
                                station.network = network;
                                list.push(station);
                                addTerm(station.name);
                                addTerm(station.city);
                            });
                        });
                        list.sort(sortStations);
                        if (typeof callback == "function") {
                            callback();
                        }
                } catch(e) {
                    var md = new Windows.UI.Popups.MessageDialog("Error fetching data from the service: " + e.message);
                    md.showAsync();
                }
            },
            // Called if the XHR fails
             function (request) {
                 var md = new Windows.UI.Popups.MessageDialog("Error fetching data from the service: " + request.responseText);
                 md.showAsync();
             });
    }


    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        load: loadNetworks,
        terms: terms
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
        if (reference && reference.length >= 2) {
            for (var i = 0; i < groupedItems.length; i++) {
                var item = groupedItems.getAt(i);
                if (item.network.id === reference[0] && item.id === reference[1]) {
                    return item;
                }
            }
        }
    }


})();
