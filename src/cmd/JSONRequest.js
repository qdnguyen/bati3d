define(['./XHRResquestbase', 'cores/Type'], function(XHRRequestBase, Type){
    

var JSONRequest = function (url, options) {
	XHRRequestBase.call(this, url, options);
};

JSONRequest.prototype = {
	_doPostSuccess : function () {
		this._data = JSON.parse(this._xhr.responseText);
	},

	get text() {
		return this._xhr.responseText;
	},

	get json() {
		return this.data;
	}
};

Type.extend(JSONRequest, XHRRequestBase);

return JSONRequest;

});
