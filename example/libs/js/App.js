$(function() {
	window.App = new WebApp(Resources.app, {
		name: "app",
		debug: true,
		start: function() {
			var self = this;
			$(function() {
				self.site.addPage("main");
			});
		}
	});
});