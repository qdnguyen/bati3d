define(['./Request', './RequestState', 'cores/Type'],function(Request, RequestState, Type){
    

var XHRRequestBase = function (url, options) {
	options = options || { };
	Request.call(this, url, options);

	var that = this;

	var xhr = new XMLHttpRequest();
	this._xhr = xhr;

	xhr.onprogress = function (evt) { that._xhrOnProgress(evt); };
	xhr.onabort    = function ()    { that._doOnCancel(); that._doOnFinish(); };
	xhr.onerror    = function ()    { that._doOnError();  that._doOnFinish(); };
	xhr.onload     = function ()    {
		var status = xhr.status;
		if ((status === 0) || (status === 200) || (!!that._range && (status == 206))) {
			that._doOnSuccess();
		}
		else {
			that._doOnError();
		}
		that._doOnFinish();
	};

	this._range = null;

	this._xhr.open("GET", this._url, this._async);

	if ("range" in options) {
		this._range = [ options.range[0], options.range[1] ];
		var rangeStr = "bytes=" + options.range[0] + "-" + options.range[1];
		xhr.setRequestHeader("Range", rangeStr);
	}

	this._prepareXHR();

	var send = options.send !== undefined ? options.send : RequestState.DEFAULT_SEND;
	if (send) {
		this.send();
	}
};

XHRRequestBase.prototype = {
	_prepareXHR : function () {
	},

	_doCancel : function () {
		this._xhr.abort();
		this._xhr = new XMLHttpRequest();
		this._xhr.open("GET", this._url, this._async);
		this._prepareXHR();
		return true;
	},

	_doSend : function () {
		this._xhr.send();
		return true;
	},

	_xhrOnProgress : function (evt) {
		var loaded = 0;
		var total  = 0;
		if (evt && evt.lengthComputable) {
			loaded = evt.loaded;
			total  = evt.total;
		}
		this._doOnProgress(loaded, total);
	}
};

Type.extend(XHRRequestBase, Request);

return XHRRequestBase;
});
