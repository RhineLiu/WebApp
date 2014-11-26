$(function() {
	window.Loading = {
		rate: function(rate) {
			rate = Math.floor(Math.min(rate, 1)*100);
			this.percent(rate);
		},
		percent: function(percent) {
			percent = Math.min(percent, 100);
			this.loading(percent+"%");
		},
		loading: function(text) {
			content.children(".percent").html(text);
			loading.appendTo(document.body);
		},
		close: function() {
			loading.remove();
		}
	};

	var loading = $("<div style='position: fixed; left: 0; top: 0; width: 100%; height: 100%; overflow: hidden; z-index: 99999; background-color: rgba(0,0,0,0.5);'>");
	var content = $("<div style='position: absolute; left: 50%; top: 50%; width: 100px; height: 100px; margin-left: -50px; margin-top: -50px;'></div>");
	loading.append(content);
	for (var i=0; i<12; ++i) {
		content.append("<div class='dot' style='position: absolute; left: 50%; top: 0%; width: 10px; height: 10px; margin-left: -5px; margin-top: 0px; background-color: #fff;'></div>");
	}
	content.append("<div class='percent' style='position: absolute; color: #ffffff; font-size: 16px; font-weight: bold; font-family: Verdana, Arial, Helvetica, sans-serif; width: 100%; text-align: center; top: 50%; margin-top: -0.5em;'></div>");

	TweenMax.staggerFromTo(content.children(".dot"), 3, {alpha: 1, width: 10, height: 10}, {alpha: 0, width: 6, height: 6, rotation: 360, transformOrigin: "5px 50px", repeat: -1, repeatDelay: 2}, 0.2);
});