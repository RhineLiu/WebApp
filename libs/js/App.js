$(function() {
	window.App = new WebApp(Resources.app, {
		name: "app",
		debug: true,
		start: function() {
			alert("start");
		}
	});
});