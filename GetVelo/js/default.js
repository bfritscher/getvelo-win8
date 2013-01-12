// For an introduction to the Grid template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=232446
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    WinJS.Namespace.define("Helper", {
        apiUrl: "http://192.168.100.40/velopass.php",
        setWarningClass: function setWarningClass(element, value) {
            if (value < 2) {
                WinJS.Utilities.addClass(element, "count" + value);
            }
        },
        stationItemTemplate: function stationItemTemplate(itemPromise) {

            //could have been done once elsewhere
            var itemtemplate = document.querySelector(".stationItemTemplate");
            var placeholder = document.createElement("div");

            //Wait for the item
            var renderCompletePromise =
              itemPromise.then(function (item) {

                  //use the item template
                  return itemtemplate

                     //wrap the retrieved value for instant access
                    .renderItem(WinJS.Promise.wrap(item))
                    .renderComplete

                    //Extend the rendercomplete promise
                    .then(function (renderedElement) {
                        //do something depending of the data
                        Helper.setWarningClass(renderedElement.querySelector('.item-bikes'), item.data.bikes);
                        Helper.setWarningClass(renderedElement.querySelector('.item-racks'), item.data.racks);
                        if (item.data.status == 2) {
                            WinJS.Utilities.addClass(renderedElement, "offline");
                        }

                        placeholder.appendChild(renderedElement);

                    });
              });

            var toReturn = {
                element: placeholder,
                renderComplete: renderCompletePromise
            }
            return toReturn;
        }

    });


    function fetchData() {
        var progress = WinJS.Utilities.query('#progressOverlay');
        var contenthost = WinJS.Utilities.query('#contenthost');
        
        progress.setStyle('display', 'block');
        contenthost.setStyle('visibility', 'hidden');
        setTimeout(function () {
            Data.load(function () {
                progress.setStyle('display', 'none');
                contenthost.setStyle('visibility', 'visible');
            });
        }, 100);
    }

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            fetchData();
            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (args.detail.arguments !== "") {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate("/pages/itemDetail/itemDetail.html", { item: JSON.parse(args.detail.arguments) });
                }
                else if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
    });

    app.addEventListener("ready", function () {
        document.getElementById("refresh").addEventListener("click", function (e) {
            fetchData();
        });
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    app.start();
})();
