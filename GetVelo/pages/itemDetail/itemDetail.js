(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var start = Windows.UI.StartScreen;
    var notifications = Windows.UI.Notifications;

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            var groupTitle = element.querySelector(".titlearea .pagetitle");
            groupTitle.textContent = item.network.name;
            groupTitle.addEventListener('click', function () {
                nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: item.network.id });
            });

            element.querySelector(".item-title").textContent = item.name;
            element.querySelector(".item-subtitle").textContent = item.city;
            var bikes = element.querySelector(".item-bikes");
            bikes.textContent = item.bikes;
            Helper.setWarningClass(bikes, item.bikes);
            var racks = element.querySelector(".item-racks");
            racks.textContent = item.racks;
            Helper.setWarningClass(racks, item.racks);
            

            element.querySelector(".content").focus();
            
            Map.create(element.querySelector("#mapDiv"), [item]);

            var content = element.querySelector(".item-content")
            for(var i=0; i< item.r.length; i++){
                var char = item.r[i];
                var div = document.createElement('div');
                div.className = 'rack' + char;
                //4 = bike, 0 rack, x error
                content.appendChild(div);
            }

            // Handle click events from the Pin command
            var pinCmd = document.getElementById("pin");
            pinCmd.winControl.hidden = false;
            pinCmd.addEventListener("click", function (e) {
                var uri = new Windows.Foundation.Uri("ms-appx:///");

                var tile = new start.SecondaryTile(
                    item.network.id + '.' + item.id,                                    // Tile ID
                    item.name,                             // Tile short name
                    item.name,                                  // Tile display name
                    JSON.stringify(Data.getItemReference(item)), // Activation argument
                    start.TileOptions.none,            // Tile options
                    uri,
                    uri// Tile logo URI
                );

                tile.requestCreateAsync().then(function (isCreated) {
                    if (isCreated) {
                        // Secondary tile successfully pinned.
                        notifications.TileUpdateManager.createTileUpdaterForSecondaryTile(item.network.id + '.' + item.id).startPeriodicUpdate(new Windows.Foundation.Uri(Helper.apiUrl + '?action=tile&network=' + item.network.id + '&station=' + item.id),
                            Windows.UI.Notifications.PeriodicUpdateRecurrence.halfHour);
                    } else {
                        // Secondary tile not pinned.
                    }
                });
            });

        },
        unload: function () {
            var pinCmd = document.getElementById("pin");
            pinCmd.winControl.hidden = true;
        }
    });
})();
