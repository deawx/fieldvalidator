var xsdoptions = {
    load: function (url) {
        var promise = $.get(url);
        xsdoptions.ready = promise.done;
        promise.done(function (xml) {
            xsdoptions.xsd = $(xml);
            xsdoptions.collection = {};
        });
        return promise;
    },

    data: function (typename) {
        if (xsdoptions.collection[typename]) {
            return xsdoptions.collection[typename];

        } else {
            var arr = [];
            if (xsdoptions.xsd) {
                xsdoptions.xsd.find("simpleType[name='" + typename + "']").find("enumeration").each(function () {
                    arr.push({value: $(this).attr("value"), label: $(this).find("documentation").text()});
                })
            }

            xsdoptions.collection[typename] = arr;
            console.log ("Loaded " + arr.length + " enumerated options from simpleType: " + typename);

            return arr;
        }
    },

    link: function (selector, typename, formatter) {
        xsdoptions.data(typename);

        xsdoptions.domListener(selector, function () {
            var $elem = $(this);
            var values = xsdoptions.data(typename);
            xsdoptions.populate($elem, values, formatter);
        });
    },

    domListener: function(selector, callback) {
        $(selector).each(callback);

        // Create a mutation observer to automatically hook up any dynamically added form fields.
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    $(node).find(selector).each(callback);
                });
            });
        });

        var toObserve = {
            attributes: false,
            characterData: false,
            childList: true,
            subtree: true
        };

        observer.observe(document, toObserve);
    },

    populate: function ($elem, values, formatter) {
        if ($elem.find("option").length <= 1) {
            $(values).each(function () {
                if (!formatter) {
                    $elem.append("<option value=\"" + this.value + "\">" + this.label + "</option>");
                } else {
                    $elem.append(formatter(this));
                }
            });
        }
    }
};
