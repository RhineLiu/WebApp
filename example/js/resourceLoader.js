(function() {
	var resourceLoader = {};

	resourceLoader.prefix = "libs/";

	resourceLoader.loadScripts = function (list, callback) {
		var loaded = 0;
		var loadNext = function () {
			resourceLoader.loadSingleScript(resourceLoader.prefix + list[loaded], function () {
				++loaded;
				if (loaded >= list.length) {
					callback && callback();
				} else {
					loadNext();
				}
			})
		};
		loadNext();
	};

	resourceLoader.loadSingleScript = function (src, callback) {
		var s = document.createElement('script');
		if (s.hasOwnProperty("async")) {
			s.async = false;
		}
		s.src = src;
		s.addEventListener('load', function () {
			this.removeEventListener('load', arguments.callee, false);
			callback();
		}, false);
		document.body.appendChild(s);
	};

	$.getJSON("resource/resource.txt", function(json) {
		window.Resources = json;
		resourceLoader.loadScripts(Resources.libScripts);
	});
})();