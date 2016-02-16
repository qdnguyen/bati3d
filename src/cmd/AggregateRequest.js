define(['./Request', './RequestState' , 'cores/Type'], function(Request, RequestState, Type){
    

var AggregateRequest = function (options) {
	options = options || { };
	Request.call(this, "*", options);

	var that = this;

	this._proxyOnProgress = function (loaded, total, req) {
		that._reqOnProgress(loaded, total, req);
	};

	this._proxyOnCancel = function (req) {
		that._reqOnCancel(req);
	};

	this._proxyOnError = function (req) {
		that._reqOnError(req);
	};

	this._proxyOnSuccess = function (req) {
		that._reqOnSuccess(req);
	};

	this._proxyOnFinish = function (req) {
		that._reqOnFinish(req);
	};

	this._aggrStartTime  = -1;
	this._aggrFinishTime = -1;

	this._eventReq = null;
	this._cancelledReqs = 0;
	this._failedReqs    = 0;
	this._succeededReqs = 0;
	this._requests = [ ];
	var requests = options.requests;
	if (requests) {
		for (var i=0, n=requests.length; i<n; ++i) {
			var r = requests[i];
			if (r && !r.sent) {
				this._installProxies(r);
				this.addRequest(r);
			}
		}
	}

	var send = options.send !== undefined ? options.send : RequestState.DEFAULT_SEND;
	if (send) {
		this.send();
	}
};

AggregateRequest.prototype = {
	_doPostCancel : function () {
		if (!this._requestsFinished) {
			this._status = RequestState.ONGOING;
		}
	},

	_doPostError : function () {
		if (!this._requestsFinished) {
			this._status = RequestState.ONGOING;
		}
	},

	_doPostSuccess : function () {
		if (!this._requestsFinished) {
			this._status = RequestState.ONGOING;
		}
	},

	_doCancel : function () {
		var requests = this._requests;
		for (var i=0, n=requests.length; i<n; ++i) {
			requests[i].cancel();
		}
		this._aggrFinishTime = (new Date()).getTime();
	},

	_doSend : function () {
		this._aggrStartTime = (new Date()).getTime();
		var requests = this._requests;
		for (var i=0, n=requests.length; i<n; ++i) {
			requests[i].send();
		}
	},

	get _requestsFinished() {
		return ((this._cancelledReqs + this._failedReqs + this._succeededReqs) == this._requests.length);
	},

	_installProxies : function (req) {
		req.addEventListener("progress", this._proxyOnProgress);
		req.addEventListener("cancel",   this._proxyOnCancel);
		req.addEventListener("error",    this._proxyOnError);
		req.addEventListener("success",  this._proxyOnSuccess);
		req.addEventListener("finish",   this._proxyOnFinish);
	},

	_uninstallProxies : function (req) {
		req.removeEventListener("progress", this._proxyOnProgress);
		req.removeEventListener("cancel",   this._proxyOnCancel);
		req.removeEventListener("error",    this._proxyOnError);
		req.removeEventListener("success",  this._proxyOnSuccess);
		req.removeEventListener("finish",   this._proxyOnFinish);
	},

	_reqOnProgress : function (loaded, total, req) {
		var idx = this._indexOf(this._requests, req);
		if (idx < 0) return;
		this._eventReq = req;
		this._doOnProgress(loaded, total);
		this._eventReq = null;
	},

	_reqOnCancel : function (req) {
		var idx = this._indexOf(this._requests, req);
		if (idx < 0) return;
		this._eventReq = req;
		//this._doOnCancel();
		this._cancelledReqs++;
		if (this._requestsFinished) {
			this._aggrFinishTime = (new Date()).getTime();
			if (this._cancelledReqs == this._requests.length) {
				this._eventReq = this;
				this._doOnCancel();
			}
		}
		else {
		}
		this._eventReq = null;
	},

	_reqOnError : function (req) {
		var idx = this._indexOf(this._requests, req);
		if (idx < 0) return;
		this._eventReq = req;
		//this._doOnError();
		this._failedReqs++;
		if (this._requestsFinished) {
			this._aggrFinishTime = (new Date()).getTime();
			this._eventReq = this;
			this._doOnError();
		}
		this._eventReq = null;
	},

	_reqOnSuccess : function (req) {
		var idx = this._indexOf(this._requests, req);
		if (idx < 0) return;
		this._eventReq = req;
		//this._doOnSuccess();
		this._succeededReqs++;
		if (this._requestsFinished) {
			this._aggrFinishTime = (new Date()).getTime();
			this._eventReq = this;
			if (this._failedReqs > 0) {
				this._doOnError();
			}
			else {
				this._doOnSuccess();
			}
		}
		this._eventReq = null;
	},

	_reqOnFinish : function (req) {
		var idx = this._indexOf(this._requests, req);
		if (idx < 0) return;
		this._uninstallProxies(req);
		this._eventReq = req;
		//this._doOnFinish();
		if (this._requestsFinished) {
			this._eventReq = this;
			this._doOnFinish();
		}
		this._eventReq = null;
	},

	get eventSenderRequest() {
		return this._eventReq;
	},

	get requests() {
		return this._requests.slice();
	},

	get requests$() {
		return this._requests;
	},

	get startTime() {
		return this._aggrStartTime;
	},

	get finishTime() {
		return this._aggrFinishTime;
	},

	get elapsedTime() {
		if (this._aggrStartTime < 0) return 0;
		if (this._aggrFinishTime < 0) return ((new Date()).getTime() - this._aggrStartTime);
		return (this._aggrFinishTime - this._aggrStartTime);
	},

	addRequest : function (r) {
		if (!r || this._sent) return;
		var idx = this._indexOf(this._requests, r);
		if (idx >= 0) return;
		this._requests.push(r);
	},

	removeRequest : function (r) {
		if (!r || this._sent) return;
		var idx = this._indexOf(this._requests, r);
		if (idx < 0) return;
		this._requests.splice(idx, 1);
	}
};

Type.extend(AggregateRequest, Request);

return AggregateRequest;

});