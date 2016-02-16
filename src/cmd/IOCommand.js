define(['cores/Type', './RequestState'],function(Type, RequestState){
    

var IOCommand = { };



/**
 * Synchronous text read.
 * This function is equivalent to issuing a SpiderGL.IOCommand.TextRequest with the async flag set to false and no callbacks, and then reading its text property.
 *
 * @param {string} url The URL of the content
 *
 * @returns {string} The text content, or null on failure.
 */
IOCommand.readText = function (url) {
	var r = new IOCommand.TextRequest(url, {async:false});
	return r.text;
};

/**
 * Asynchronous text read.
 * This function creates a SpiderGL.IOCommand.TextRequest with the async and seng flags set to true, overriding their values in the options parameter.
 *
 * @param {string} url The URL of the content
 * @param {object} options The request options.
 *
 * @returns {SpiderGL.IOCommand.TextRequest} The internally generated SpiderGL.IOCommand.TextRequest.
 */
IOCommand.requestText = function (url, options) {
	options = options !== undefined ? options : {};
	options.async = true;
	options.send  = true;
	var r = new IOCommand.TextRequest(url, options);
	return r;
};



/**
 * Synchronous JSON object read.
 * This function is equivalent to issuing a SpiderGL.IOCommand.JSONRequest with the async flag set to false and no callbacks, and then reading its json property.
 *
 * @param {string} url The URL of the content
 *
 * @returns {object} The JSON-parsed object, or null on failure.
 */
IOCommand.readJSON = function (url) {
	var r = new IOCommand.JSONRequest(url, {async:false});
	return r.json;
};

/**
 * Asynchronous JSON read.
 * This function creates a SpiderGL.IOCommand.JSONRequest with the async and seng flags set to true, overriding their values in the options parameter.
 *
 * @param {string} url The URL of the content
 * @param {object} options The request options.
 *
 * @returns {SpiderGL.IOCommand.JSONRequest} The internally generated SpiderGL.IOCommand.JSONRequest.
 */
IOCommand.requestJSON = function (url, options) {
	options = options !== undefined ? options : {};
	options.async = true;
	options.send  = true;
	var r = new IOCommand.JSONRequest(url, options);
	return r;
};

/**
 * Creates a SpiderGL.IOCommand.BinaryRequest.
 *
 * SpiderGL.IOCommand.BinaryRequest is the base class for I/O requests.
 *
 * @class The SpiderGL.IOCommand.BinaryRequest is the base class for I/O requests.
 *
 * @augments SpiderGL.IOCommand.XHRRequestBase
 */


/**
 * Synchronous binary data read.
 * This function is equivalent to issuing a SpiderGL.IOCommand.BinaryRequest with the async flag set to false and no callbacks, and then reading its buffer property.
 *
 * @param {string} url The URL of the content
 *
 * @returns {ArrayBuffer} The content binary data, or null on failure.
 */
IOCommand.readBinary = function (url) {
	var r = new IOCommand.BinaryRequest(url, {async:false});
	return r.buffer;
};

/**
 * Asynchronous binary read.
 * This function creates a SpiderGL.IOCommand.BinaryRequest with the async and seng flags set to true, overriding their values in the options parameter.
 *
 * @param {string} url The URL of the content
 * @param {object} options The request options.
 *
 * @returns {SpiderGL.IOCommand.BinaryRequest} The internally generated SpiderGL.IOCommand.BinaryRequest.
 */
IOCommand.requestBinary = function (url, options) {
	options = options !== undefined ? options : {};
	options.async = true;
	options.send  = true;
	var r = new IOCommand.BinaryRequest(url, options);
	return r;
};

/**
 * Creates a SpiderGL.IOCommand.ImageRequest.
 *
 * SpiderGL.IOCommand.ImageRequest is the base class for I/O requests.
 * The request is always asynchronous, meaning that the async flag is ignored.
 *
 * @class The SpiderGL.IOCommand.ImageRequest is the base class for I/O requests.
 *
 * @augments SpiderGL.IOCommand.Request
 */


/**
 * Asynchronous image read.
 * This function creates a SpiderGL.IOCommand.ImageRequest with the async and seng flags set to true, overriding their values in the options parameter.
 *
 * @param {string} url The URL of the content
 * @param {object} options The request options.
 *
 * @returns {SpiderGL.IOCommand.ImageRequest} The internally generated SpiderGL.IOCommand.ImageRequest.
 */
IOCommand.requestImage = function (url, options) {
	options = options !== undefined ? options : {};
	options.async = true;
	options.send  = true;
	var r = new IOCommand.ImageRequest(url, options);
	return r;
};

/**
 * Creates a SpiderGL.IOCommand.AggregateRequest.
 *
 * SpiderGL.IOCommand.AggregateRequest is the base class for I/O requests.
 *
 * @class The SpiderGL.IOCommand.AggregateRequest is the base class for I/O requests.
 *
 * @augments SpiderGL.IOCommand.Request
 */

return IOCommand;

});
