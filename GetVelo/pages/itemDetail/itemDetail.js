(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            element.querySelector(".titlearea .pagetitle").textContent = item.network.name;
            element.querySelector("article .item-title").textContent = item.name;
            element.querySelector("article .item-subtitle").textContent = item.city;
            element.querySelector("article .item-image").src = item.backgroundImage;
            element.querySelector("article .item-image").alt = item.subtitle;
            element.querySelector("article .item-content").innerHTML = item.content;
            element.querySelector(".content").focus();
			
			var content = element.querySelector("article .item-content")
			for(var i=0; i< item.r.length; i++){
				var char = item.r[i];
				var div = document.createElement('div');
				div.textContent = char;
				//4 = bike, 0 rack, x error
				content.appendChild(div);
			}

        }
    });
})();
