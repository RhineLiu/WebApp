$(function () {
	var Page = WebApp.Page.extend({
		ctor: function (name, view) {
			var self = this;
			self._super(name, view);

			self._days = view.children(".days");
			self._days_meet = self._days.children(".meet");
			self._days_love = self._days.children(".love");
			self._days_marry = self._days.children(".marry");

			//load json
			var url = "jsons/days.js";
			new WebApp.ScriptLoader(url, function (jsons) {
				var days = jsons[url];
				var now = new Date().getTime();
				showDays("meet");
				showDays("love");
				showDays("marry");

				function showDays(type) {
					var time = new Date(days[type]).getTime();
					var _days = Math.ceil((now - time) / 86400 / 1000);
					self["_days_" + type].text(_days);
				}
			});
		},
		initView: function () {
			var self = this;
			self._super();

			self._days.css("left", (self.view.width() - self._days.width()) / 2);
			self._days.css("top", (self.view.height() - self._days.height()) / 2);
			TweenMax.fromTo(self._days, 3, {height: 0}, {height: self._days.height(), ease: Linear.easeNone});
		}
	});

	App.site.registerPage("main", Page);
});