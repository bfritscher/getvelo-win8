(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var start = Windows.UI.StartScreen;
    var notifications = Windows.UI.Notifications;
    var itemRef, element;

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (e, options) {
            itemRef = options.item;
            element = e;
            Data.items.addEventListener("reload", this._updatePage);
            this._updatePage();
        },
        _updatePage: function () {
            var item = Data.resolveItemReference(itemRef);
            if (item != undefined) {
                var groupTitle = element.querySelector(".titlearea .pagetitle");
                groupTitle.textContent = item.network.name;
                groupTitle.onclick = function () {
                    nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: item.network.id });
                };

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
                WinJS.Utilities.setInnerHTML(content, "");
                for (var i = 0; i < item.r.length; i++) {
                    var char = item.r[i];
                    var div = document.createElement('div');
                    div.className = 'rack' + char;
                    //4 = bike, 0 rack, x error
                    content.appendChild(div);
                }

                // Handle click events from the Pin command
                var pinCmd = document.getElementById("pin");
                pinCmd.winControl.hidden = false;
                pinCmd.onclick = function (e) {
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
                };
            }
        },
        unload: function () {
            var pinCmd = document.getElementById("pin");
            pinCmd.winControl.hidden = true;
        }
    });
})();
