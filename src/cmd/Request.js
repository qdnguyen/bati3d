define(['./RequestState', './defaultObject'], function(RequestState, defaultObject){
    
var Request = function (url, options) {
        
	options = defaultObject({
		async      : RequestState.DEFAULT_ASYNC,
		send       : RequestState.DEFAULT_SEND,
		onProgress : null,
		onCancel   : null,
		onError    : null,
		onSuccess  : null,
		onFinish   : null
	}, options);
	this._url     = url;
	this._async   = options.async;
	this._status  = RequestState.NONE;
	this._sent    = false;
	this._aborted = false;
	this._data    = null;
	this._loaded  = 0;
	this._total   = 0;

	this._events = {
		progress : { main : null, listeners : [ ] },
		cancel   : { main : null, listeners : [ ] },
		error    : { main : null, listeners : [ ] },
		success  : { main : null, listeners : [ ] },
		finish   : { main : null, listeners : [ ] }
	};

	this.onProgress = options.onProgress;
	this.onCancel   = options.onCancel;
	this.onError    = options.onError;
	this.onSuccess  = options.onSuccess;
	this.onFinish   = options.onFinish;
};



Request.prototype = {
	_indexOf : function (handlers, h) {
		for (var i=0, n=handlers.length; i<n; ++i) {
			if (handlers[i] == h) {
				return i;
			}
		}
		return -1;
	},

	_setMainListener : function (eventName, eventHandler) {
		var evt = this._events[eventName];
		if (!evt) return;
		if (evt.main == eventHandler) return;
		if (eventHandler) { this.addEventListener(eventName, eventHandler); }
		else { this.removeEventListener(eventName, eventHandler); }
		evt.main = eventHandler;
	},

	_dispatch : function () {
		var name = arguments[0];
		var evt  = this._events[name];
		if (!evt) return;
		var args = Array.prototype.slice.call(arguments, 1);
		args.push(this);
		var lst  = evt.listeners;
		for (var i=0, n=lst.length; i<n; ++i) {
			lst[i].apply(null, args);
		}
	},

	_doPostProgress : function () {
	},

	_doPostCancel : function () {
	},

	_doPostError : function () {
	},

	_doPostSuccess : function () {
	},

	_doPostFinish : function () {
	},

	_doOnProgress : function (loaded, total) {
		if (this._aborted) return;
		this._loaded = loaded;
		this._total  = total;
		this._doPostProgress();
		this._dispatch("progress", this._loaded, this._total);
	},

	_doOnCancel : function () {
		if (this._aborted) return;
		this._status = RequestState.CANCELLED;
		this._finishTime = (new Date()).getTime();
		this._doPostCancel();
		this._dispatch("cancel");
	},

	_doOnError : function () {
		if (this._aborted) return;
		this._status = RequestState.FAILED;
		this._finishTime = (new Date()).getTime();
		this._doPostError();
		this._dispatch("error");
	},

	_doOnSuccess : function () {
		if (this._aborted) return;
		this._status = RequestState.SUCCEEDED;
		this._finishTime = (new Date()).getTime();
		this._doPostSuccess();
		this._dispatch("success");
	},

	_doOnFinish : function () {
		this._doPostFinish();
		this._dispatch("finish");
	},

	_doSend : function () {
		return false;
	},

	_doCancel : function () {
		return false;
	},

	get canSend() {
		return (this._url && !this._sent);
	},

	get url() {
		return this._url;
	},

	set url(s) {
		this.cancel();
		this._url = s;
	},

	get status() {
		return this._status;
	},

	get data() {
		return this._data;
	},

	get bytesLoaded() {
		return this._loaded;
	},

	get bytesTotal() {
		return this._total;
	},

	get sent() {
		return this._sent;
	},

	get ongoing() {
		return (this._status == RequestState.ONGOING);
	},

	get cancelled() {
		return (this._status == RequestState.CANCELLED);
	},

	get failed() {
		return (this._status == RequestState.FAILED);
	},

	get succeeded() {
		return (this._status == RequestState.SUCCEEDED);
	},

	get finished() {
		return (this.succeeded || this.failed || this.cancelled);
	},

	get startTime() {
		return this._startTime;
	},

	get finishTime() {
		return this._finishTime;
	},

	get elapsedTime() {
		if (this._startTime < 0) return 0;
		if (this._finishTime < 0) return ((new Date()).getTime() - this._startTime);
		return (this._finishTime - this._startTime);
	},

	addEventListener : function (eventName, eventHandler) {
		if (!eventHandler) return;
		var evt = this._events[eventName];
		if (!evt) return;
		var idx = this._indexOf(evt.listeners, eventHandler);
		if (idx >= 0) return;
		evt.listeners.push(eventHandler);
	},

	removeEventListener : function (eventName, eventHandler) {
		var evt = this._events[eventName];
		if (!evt) return;
		var idx = this._indexOf(evt.listeners, eventHandler);
		if (idx < 0) return;
		evt.listeners.splice(idx, 1);
	},

	get onProgress() {
		return this._events.progress.main;
	},

	set onProgress(f) {
		this._setMainListener("progress", f);
	},

	get onCancel() {
		return this._events.cancel.main;
	},

	set onCancel(f) {
		this._setMainListener("cancel", f);
	},

	get onError() {
		return this._events.error.main;
	},

	set onError(f) {
		this._setMainListener("error", f);
	},

	get onSuccess() {
		return this._events.success.main;
	},

	set onSuccess(f) {
		this._setMainListener("success", f);
	},

	get onFinish() {
		return this._events.finish.main;
	},

	set onFinish(f) {
		this._setMainListener("finish", f);
	},

	cancel : function () {
		if (!this.ongoing) { return false; }
		this._status  = RequestState.CANCELLED;
		this._aborted = true;
		var r = this._doCancel();
		this._finishTime = (new Date()).getTime();
		return r;
	},

	send : function () {
		if (!this.canSend) { return false; }
		this._data       = null;
		this._status     = RequestState.ONGOING;
		this._aborted    = false;
		this._sent       = true;
		this._finishTime = -1;
		this._startTime  = (new Date()).getTime();
		var r = this._doSend();
		if (!r) {
			this._startTime = -1;
			this._status = RequestState.NONE;
			this._sent = false;
		};
		return r;
	}
};

return Request;

});
