define(['./RequestState', './Request' , 'cores/Type'], function(RequestState, Request, Type){
    
var ImageRequest = function (url, options) {
	options = options || { };
	Request.call(this, url, options);

	var that = this;

	var img = new Image();
	this._img  = img;
	this._data = img;

	img.onabort = function () { that._doOnCancel();  that._doOnFinish(); };
	img.onerror = function () { that._doOnError();   that._doOnFinish(); };
	img.onload  = function () { that._doOnSuccess(); that._doOnFinish(); };

	if (typeof img.onprogress != "undefined") {
		img.onprogress = function (evt) { that._imgOnProgress(evt); };
	}

	var send = options.send !== undefined ? options.send : RequestState.DEFAULT_SEND;
	if (send) {
		this.send();
	}
};

ImageRequest.prototype = {
	_doPostSuccess : function () {
		this._data = this._img;
	},

	_doCancel : function () {
		this._img.src = null;
		this._img = new Image();
		return true;
	},

	_doSend : function () {
		this._img.src = this._url;
		return true;
	},

	_imgOnProgress : function (evt) {
		var loaded = 0;
		var total  = 0;
		if (evt && evt.lengthComputable) {
			loaded = evt.loaded;
			total  = evt.total;
		}
		this._doOnProgress(loaded, total);
	},

	get image() {
		return this.data;
	}
};

Type.extend(ImageRequest, Request);

return ImageRequest;
});
