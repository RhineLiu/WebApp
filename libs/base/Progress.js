/**
 * Progress-进度类
 *
 * 通过本进度的onUpdate、onError和onComplete回调来进行进度显示
 *
 * @author  Rhine.Liu(lyh_0100@sohu.com)
 * @date    2014.11.23
 * @version 1.1.0
 */
(function () {

	"use strict";

	window.WebApp = window.WebApp || {};

	WebApp.Progress = Class.extend({
		/**
		 * 进度开始
		 */
		onStart: function() {},
		/**
		 * 进度更新
		 * @param {int|float} percent 百分之X
		 * @param {int}       counter
		 * @param {int}       total
		 */
		onUpdate: function(percent, counter, total) {},
		/**
		 * 进度中出现错误
		 * @param {string} info 错误信息
		 */
		onError: function(info) {
			window.console && console.log(info);
		},
		/**
		 * 进度完成
		 */
		onComplete: function() {},

		ctor: function(prop) {
			for (var name in prop) {
				this[name] = prop[name];
			}
		}
	});
})();