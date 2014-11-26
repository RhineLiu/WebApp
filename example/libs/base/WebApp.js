(function () {

	"use strict";

	window.WebApp = Class.extend({
		name: "",
		resources: {},
		htmls: {},
		site: null,
		/**
		 * @param    {object} resources
		 * @p-config {array}  styles
		 * @p-config {array}  scripts
		 * @p-config {object} htmls
		 * @p-config {array}  images
		 * @param    {object} prop
		 */
		ctor: function (resources, prop) {
			for (var name in prop) {
				this[name] = prop[name];
			}

			this.resources = resources;
			this.site = new Site(this.name, this.resources.htmls);
			var self = this;
			setTimeout(function() {
				self.loadResources();
			}, 0);
		},
		/**
		 * 启动函数，其中start()在实例化时需要重写
		 */
		start: function () {
		},
		__start: function () {
			this.start();
			this.start = function () {
			};
		},
		/**
		 * App启动前加载如下资源：
		 * 1.sctyle
		 * 2.script
		 * 3.html
		 * 4.image
		 */
		loadResources: function () {
			var self = this;
			var styles = this.resources.styles;
			var scripts = this.resources.scripts;
			var htmls = this.resources.htmls;
			var images = this.resources.images;
			var total = 0, counter = 0;

			this.onResLoadStart();

			if (styles) total += styles.length;
			if (scripts) total += scripts.length;
			if (htmls) {
				var arr = [];
				for (var name in htmls) {
					arr.push(htmls[name]);
				}
				total += arr.length;
				htmls = arr;
			}
			if (images) total += images.length;

			if (styles && styles.length) new WebApp.StyleLoader(styles, {onUpdate: onUpdate});
			if (scripts && scripts.length) new WebApp.ScriptLoader(scripts, {onUpdate: onUpdate});
			if (htmls && htmls.length) new WebApp.HtmlLoader(htmls, {onUpdate: onUpdate});
			if (images && images.length) new WebApp.HtmlLoader(images, {onUpdate: onUpdate});

			if (!total) this.onResLoadComplete();

			function onUpdate() {
				self.onResLoadUpdate(++counter / total * 100, counter, total);
				if (counter == total) self.onResLoadComplete();
			}
		},
		/**
		 * 开始加载资源
		 */
		onResLoadStart: function () {
			if (this.resources.progress) this.resources.progress.onStart();
		},
		/**
		 * 完成一个资源加载时更新
		 * @param {int|float} percent 百分之X
		 * @param {int}       counter
		 * @param {int}       total
		 */
		onResLoadUpdate: function (percent, counter, total) {
			if (this.resources.progress) this.resources.progress.onUpdate(percent, counter, total);
		},
		/**
		 * 完成所有资源加载时更新
		 */
		onResLoadComplete: function () {
			if (this.resources.progress) this.resources.progress.onComplete();
			this.__start();
		},

		/**
		 * debug模式时输出log
		 */
		debug: false,
		log: function() {
			if (this.debug) console.log.apply(console, arguments);
		}
	});

	var Site = Class.extend({
		name: null,
		view: null,
		Pages: {},
		htmls: {},
		_pages: {},
		/**
		 * @param {string} name
		 * @param {object} htmls
		 */
		ctor: function (name, htmls) {
			this.name = name;
			this.htmls = htmls || {};
			this.view = $("<div id='site_" + name + "'>").appendTo(document.body);
		},
		/**
		 * 返回Site内的Page实例
		 * @param {string} name
		 * @returns {object}
		 */
		getPage: function (name) {
			return this._pages[name];
		},
		/**
		 * 添加Page到Site里，完成后执行回调函数
		 * @param {string}   name
		 * @param {function} callback
		 */
		addPage: function (name, callback) {
			var self = this;
			if (this.getPage(name)) {
				callback && callback(this.getPage(name));
			} else {
				this.__loadPage(name, function (page) {
					self.view.append(page.view);
					page.onAdded();
					callback && callback(page);
				});
			}
		},
		/**
		 * 从Site里移除Page
		 * @param {string} name
		 */
		removePage: function (name) {
			var page = this._pages[name];
			if (page) {
				page.onRemoved();
				page.view.remove();
				delete this._pages[name];
			}
		},
		/**
		 * 加载Page
		 * @param {string}   name
		 * @param {function} callback
		 * @private
		 */
		__loadPage: function (name, callback) {
			var self = this;
			var url = this.htmls[name];
			var page = new WebApp.HtmlLoader(url, function (htmls) {
				var Page = self.Pages[name] || WebApp.Page;
				callback(
					self._pages[name] = new Page(name, $(htmls[url]))
				);
			});
		},
		/**
		 * 注册一个Page类（WebApp.Page的子类）
		 * @param {string} name
		 * @param {object} Page
		 */
		registerPage: function (name, Page) {
			this.Pages[name] = Page;
		}
	});

	WebApp.Page = Class.extend({
		name: null,
		view: null,
		ctor: function (name, view) {
			this.name = name;
			this.view = view;
		},
		onAdded: function () {
			this.initView();
			this.initEvent();
		},
		onRemoved: function () {
		},
		initView: function () {
		},
		initEvent: function () {
		}
	});
})();