define(['./XHRRequestBase', 'cores/Type'],function(XHRRequestBase, Type){
    
var TextRequest = function (url, options) {
	XHRRequestBase.call(this, url, options);
};

TextRequest.prototype = {
	_doPostSuccess : function () {
		this._data = this._xhr.responseText;
	},

	get text() {
		return this.data;
	}
};

Type.extend(TextRequest, XHRRequestBase);

return TextRequest;
});
