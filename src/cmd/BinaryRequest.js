define(['./XHRRequestBase', 'cores/Type'], function(XHRRequestBase, Type){
    

var BinaryRequest = function (url, options) {
	XHRRequestBase.call(this, url, options);
};

BinaryRequest.prototype = {
	_prepareXHR : function () {
		var xhr = this._xhr;
		var overrideMime = false;

		/*
		if (xhr.hasOwnProperty("responseType")) {
			try {
				xhr.responseType = "arraybuffer";
			}
			catch (e) {
				overrideMime = true;
			}
		}
		else {
				overrideMime = true;
		}
		*/

		if (overrideMime) {
			xhr.overrideMimeType("text/plain; charset=x-user-defined");
		}

		xhr.responseType = "arraybuffer";
	},

	_setArrayBuffer : function () {
		var xhr = this._xhr;

		if (xhr.responseType == "arraybuffer") {
			this._data = xhr.response;
		}
		else if (xhr.mozResponseArrayBuffer != null) {
			this._data = xhr.mozResponseArrayBuffer;
		}
		else if (xhr.responseText != null) {
			var data = new String(xhr.responseText);
			var arr  = new Array(data.length);
			for (var i=0, n=data.length; i<n; ++i) {
				arr[i] = data.charCodeAt(i) & 0xff;
			}
			this._data = (new Uint8Array(arr)).buffer;
		}
		else {
			this._data = null;
		}
	},

	_doPostSuccess : function () {
		this._setArrayBuffer();
	},

	get data() {
		if (this.ongoing) {
			this._setArrayBuffer();
		}
		return this._data;
	},

	get buffer() {
		return this.data;
	}
};

Type.extend(BinaryRequest, XHRRequestBase);

return BinaryRequest;

});
