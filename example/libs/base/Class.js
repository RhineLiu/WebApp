(function() {
	var fnTest = /xyz/.test(function () {
		xyz;
	}) ? /\b_super\b/ : /.*/;
	this.Class = function () {};
	this.Class.extend = function (prop) {
		var _super = this.prototype;
		var pty = new this();
		for (var name in prop) {
			if (typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name])) {
				pty[name] = (function (name, fn) {
					return function () {
						var tmp = this._super;
						// 提供超类的super方法
						this._super = _super[name];
						var ret = fn.apply(this, arguments);
						this._super = tmp;
						return ret;
					};
				})(name, prop[name]);
			} else {
				pty[name] = prop[name];
			}
		}

		function newClass() {
			if (typeof this.ctor == "function") this.ctor.apply(this, arguments);
		}
		newClass.prototype = pty;
		newClass.prototype.constructor = Class;
		newClass.extend = arguments.callee;
		return newClass;
	};
})();