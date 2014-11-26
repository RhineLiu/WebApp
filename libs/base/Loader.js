/**
 * Loader-加载器，包括：
 * 1.图片加载器
 * 2.script(JS)加载器
 * 3.html(DOM)加载器
 * 4.json加载器
 * 5.style(CSS)加载器
 *
 * 异步加载多个文件，提供进度对象的onUpdate、onError和onComplete回调，并可以限制同时加载数
 *
 * @author  Rhine.Liu(lyh_0100@sohu.com)
 * @date    2014.11.21
 * @version 1.4.1
 */
(function () {

	"use strict";

	window.WebApp = window.WebApp || {};

	/**
	 * 加载器父类
	 */
	WebApp.Loader = Class.extend({
		progress: null,
		files: null,
		fileQuantity: 0,
		fileCounter: 0,
		filePos: 0,
		thread: 16,
		threadCounter: 0,
		contents: null,
		prefix: "resource/",

		ctor: function (files) {
			this.contents = {};
			if (files) this.load.apply(this, arguments);
		},
		/**
		 * 加载器接口函数
		 * @param       {array|string}      files
		 * @param       {object|function}   progress
		 * @p-config    {function}          onUpdate
		 * @p-config    {function}          onComplete
		 * @p-config    {function}          onError
		 * @param       {int}               thread
		 */
		load: function (files, progress, thread) {
			if (typeof files == "string") files = [files];
			if (typeof progress == "function") progress = {onComplete: progress};
			this.progress = new WebApp.Progress(progress);
			if (!files || !files.length) {
				progress.onError("no files to load");
				return;
			}
			this.files = files;
			this.fileQuantity = files.length;
			this.thread = thread || this.thread;

			this.loadFiles();
		},

		/**
		 * 加载器内部函数，子类无需重写
		 */
		loadFiles: function () {
			this.progress.onStart();
			for (var i = this.threadCounter; i < this.thread; ++i) {
				var file = this.files[this.filePos++];
				if (!file) break;
				this.loadFile(file);
			}
		},

		/**
		 * 返回前缀URL
		 * @param   {string} url
		 * @returns {string}
		 */
		prefixUrl: function(url) {
			if (!/^http+(s{0,1}):\/\//.test(url) && !/^.{1,2}\//.test(url)) url = this.prefix + url;
			return url;
		},

		/**
		 * 加载器内部函数，子类无需重写
		 */
		onLoad: function () {
			--this.threadCounter;
			++this.fileCounter;
			this.progress.onUpdate(Math.floor(100 * this.fileCounter / this.fileQuantity), this.fileCounter, this.fileQuantity);
			if (this.fileCounter == this.fileQuantity) {
				this.progress.onComplete(this.contents);
			} else {
				this.loadFiles();
			}
		},

		/**
		 * 加载器功能函数，子类需要重写，并要在file加载完成时调用onLoad
		 * @param {string} file
		 */
		loadFile: function (file) {
		},

		/**
		 * 加载一个文件成功时的回调
		 * @param {string} file
		 * @param {all}    response
		 */
		onSuccesss: function (file, response) {
			this.saveFile(file, response);
			this.contents[file] = response;
		},

		/**
		 * 发生错误时的回调
		 * @param {string} file
		 */
		onError: function (file) {
			this.progress.onError("file load with error: " + file);
		},

		/**
		 * 保存内容，子类需要时要重写
		 * @param {string} file
		 * @param {vars}   content
		 */
		saveFile: function (file, content) {
		}
	});

	/**
	 * 图片加载器
	 */
	WebApp.ImageLoader = WebApp.Loader.extend({
		thread: 16,
		loadFile: function (file) {
			this._super(file);
			var self = this;
			var img = new window.Image();
			img.onload = function () {
				self.onSuccesss(file, img);
				self.onLoad();
			};
			img.onerror = function () {
				self.onError(file);
				self.onLoad();
			};
			img.src = this.prefixUrl(url);
		}
	});

	/**
	 * 文本加载器
	 */
	WebApp.TextLoader = WebApp.Loader.extend({
		thread: 16,
		loadFile: function (file) {
			this._super(file);
			var self = this;
			$.ajax({
				url: this.prefixUrl(file),
				async: false,
				contentType: false,
				dataType: "text",
				success: function (text) {
					self.onSuccesss(file, text);
					self.onLoad();
				},
				error: function () {
					self.onError(file);
					self.onLoad();
				}
			});
		}
	});

	/**
	 * html加载器
	 */
	var Htmls = {};
	WebApp.HtmlLoader = WebApp.TextLoader.extend({
		thread: 16,
		loadFile: function (file) {
			if (Htmls[file]) {
				this.contents[file] = Htmls[file];
				this.onLoad();
			} else this._super(file);
		},
		saveFile: function (file, content) {
			Htmls[file] = content;
		}
	});

	/**
	 * script加载器
	 * 加载并执行js文件
	 */
	WebApp.ScriptLoader = WebApp.TextLoader.extend({
		thread: 16,
		onSuccesss: function (file, text) {
			var self = this;
			this._super(file, text);

			try {
				var ret = eval(text);
				this.saveFile(file, text);
				this.contents[file] = ret;
			} catch (e) {
				self.onError(file);
				throw new Error(e);
//				setTimeout(function() {
//					eval(text);
//				}, 0);
			}
		}
	});

	/**
	 * json加载器
	 * 加载并编译json文件
	 */
	var Jsons = {};
	WebApp.JsonLoader = WebApp.TextLoader.extend({
		thread: 16,
		loadFile: function (file) {
			if (Jsons[file]) {
				this.contents[file] = JSON.parse(Jsons[file]);
				this.onLoad();
			} else this._super(file);
		},
		onSuccesss: function (file, text) {
			var self = this;
//			this._super(file, text);

			try {
				var json = JSON.parse(text);
				this.saveFile(file, text);
				this.contents[file] = json;
			} catch (e) {
				self.onError(file);
			}
		},
		saveFile: function (file, content) {
			Jsons[file] = content;
		}
	});

	/**
	 * style加载器
	 */
	WebApp.StyleLoader = WebApp.Loader.extend({
		thread: 16,
		loadFile: function (file) {
			this._super(file);
			var self = this;
			var link = document.createElement("link");
			link.rel = "stylesheet";
			link.rev = "stylesheet";
			link.type = "text/css";
			link.media = "screen";
			link.onload = function () {
				self.onSuccesss(file, link);
				self.onLoad();
			};
			link.onerror = function () {
				self.onError(file);
				self.onLoad();
			};
			link.href = this.prefixUrl(file);
			document.getElementsByTagName("head")[0].appendChild(link);
		}
	});
})();