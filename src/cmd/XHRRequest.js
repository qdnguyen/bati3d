define(['./XHRRequestBase', 'cores/Type'],function(XHRRequestBase, Type){
    

var XHRRequest = function (url, options) {
	XHRRequestBase.call(this, url, options);
};

XHRRequest.prototype = {
	_doPostSuccess : function () {
		this._data = this._xhr.responseText;
	},

	get xhr() {
		return this._xhr;
	},

	get response() {
		return this.data;
	}
};

Type.extend(XHRRequest, XHRRequestBase);

return XHRRequestBase;

});