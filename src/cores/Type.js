/*
SpiderGL Computer Graphics Library
Copyright (c) 2010, Marco Di Benedetto - Visual Computing Lab, ISTI - CNR
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of SpiderGL nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview Type
 */

/**
 * The SpiderGL.Type namespace.
 *
 * @namespace The SpiderGL.Type namespace.
 */
define(function(){
    

var Type = { };

/**
 * Little-Endian flag.
 * It is true if the host system is little endian, false otherwise.
 *
 * @constant
 * @type bool
 *
 * @see SpiderGL.Type.BIG_ENDIAN
 */
Type.LITTLE_ENDIAN = (function(){
	var a = new Uint8Array([0x12, 0x34]);
	var b = new Uint16Array(a.buffer);
	return (b[0] == 0x3412);
})();

/**
 * Big-Endian flag.
 * It is true if the host system is big endian, false otherwise.
 *
 * @constant
 * @type bool
 *
 * @see SpiderGL.Type.LITTLE_ENDIAN
 */
Type.BIG_ENDIAN = !Type.BIG_ENDIAN;

/**
 * Constant for undefined (void) type.
 *
 * @constant
 * @type number
 */
Type.NO_TYPE = 0;

/**
 * Constant for 8-bit signed integer type.
 *
 * @constant
 * @type number
 */
Type.INT8 = 1;

/**
 * Constant for 8-bit unsigned integer type.
 *
 * @constant
 * @type number
 */
Type.UINT8 = 2;

/**
 * Constant for 16-bit signed integer type.
 *
 * @constant
 * @type number
 */
Type.INT16 = 3;

/**
 * Constant for 16-bit unsigned integer type.
 *
 * @constant
 * @type number
 */
Type.UINT16 = 4;

/**
 * Constant for 32-bit signed integer type.
 *
 * @constant
 * @type number
 */
Type.INT32 = 5;

/**
 * Constant for 32-bit unsigned integer type.
 *
 * @constant
 * @type number
 */
Type.UINT32 = 6;

/**
 * Constant for 32-bit floating point type.
 *
 * @constant
 * @type number
 */
Type.FLOAT32 = 7;

/**
 * Alias for Int8Array.BYTES_PER_ELEMENT.
 *
 * @constant
 * @type number
 */
Type.SIZEOF_INT8 = Int8Array.BYTES_PER_ELEMENT;

/**
 * Alias for Uint8Array.BYTES_PER_ELEMENT.
 *
 * @constant
 * @type number
 */
Type.SIZEOF_UINT8 = Uint8Array.BYTES_PER_ELEMENT;

/**
 * Alias for Int16Array.BYTES_PER_ELEMENT.
 *
 * @constant
 * @type number
 */
Type.SIZEOF_INT16 = Int16Array.BYTES_PER_ELEMENT;

/**
 * Alias for Uint16Array.BYTES_PER_ELEMENT.
 *
 * @constant
 * @type number
 */
Type.SIZEOF_UINT16 = Uint16Array.BYTES_PER_ELEMENT;

/**
 * Alias for Int32Array.BYTES_PER_ELEMENT.
 *
 * @constant
 * @type number
 */
Type.SIZEOF_INT32 = Int32Array.BYTES_PER_ELEMENT;

/**
 * Alias for Uint32Array.BYTES_PER_ELEMENT.
 *
 * @constant
 * @type number
 */
Type.SIZEOF_UINT32 = Uint32Array.BYTES_PER_ELEMENT;

/**
 * Alias for Float32Array.BYTES_PER_ELEMENT.
 *
 * @constant
 * @type number
 */
Type.SIZEOF_FLOAT32 = Float32Array.BYTES_PER_ELEMENT;

/* *
 * Alias for Float64Array.BYTES_PER_ELEMENT.
 *
 * @constant
 * @type number
 */
//var SpiderGL.Type.SIZEOF_FLOAT64 = Float64Array.BYTES_PER_ELEMENT;

/**
 * Returns the size of the type expressed by the passed symbolic constant.
 *
 * @param {number} sglType A SpiderGL type symbolic constants, i.e. SpiderGL.Type.UINT8.
 * @return {number} The size in bytes of the type.
 */
Type.typeSize = (function(){
	var typeMap = { };
	typeMap[Type.NO_TYPE] = 0;
	typeMap[Type.INT8   ] = Type.SIZEOF_INT8;
	typeMap[Type.UINT8  ] = Type.SIZEOF_UINT8;
	typeMap[Type.INT16  ] = Type.SIZEOF_INT16;
	typeMap[Type.UINT16 ] = Type.SIZEOF_UINT16;
	typeMap[Type.INT32  ] = Type.SIZEOF_INT32;
	typeMap[Type.UINT32 ] = Type.SIZEOF_UINT32;
	typeMap[Type.FLOAT32] = Type.SIZEOF_FLOAT32;
	return function (sglType) {
		return typeMap[sglType];
	};
})();

/**
 * Maps a SpiderGL type symbolic constant to a WebGL type constant.
 * For example, calling this function with SpiderGL.Type.UINT8 as argument will return WebGLRenderingContext.UNSIGNED_BYTE.
 *
 * @param {number} sglType A SpiderGL type symbolic constants, i.e. SpiderGL.Type.UINT8.
 * @return {number} The corresponding WebGLRenderingContext type constant, i.e. WebGLRenderingContext.UNSIGNED_BYTE.
 */
Type.typeToGL = (function(){
	var typeMap = { };
	typeMap[Type.NO_TYPE] = WebGLRenderingContext.NONE;
	typeMap[Type.INT8   ] = WebGLRenderingContext.BYTE;
	typeMap[Type.UINT8  ] = WebGLRenderingContext.UNSIGNED_BYTE;
	typeMap[Type.INT16  ] = WebGLRenderingContext.SHORT;
	typeMap[Type.UINT16 ] = WebGLRenderingContext.UNSIGNED_SHORT;
	typeMap[Type.INT32  ] = WebGLRenderingContext.INT;
	typeMap[Type.UINT32 ] = WebGLRenderingContext.UNSIGNED_INT;
	typeMap[Type.FLOAT32] = WebGLRenderingContext.FLOAT;
	return function (sglType) {
		return typeMap[sglType];
	};
})();

/**
 * Maps a WebGL type constant to a WebGL type constant.
 * For example, calling this function with WebGLRenderingContext.UNSIGNED_BYTE as argument will return SpiderGL.Type.UINT8.
 *
 * @param {number} glType A WebGL type symbolic constants, i.e. WebGLRenderingContext.UNSIGNED_BYTE.
 * @return {number} The corresponding SpiderGL type constant, i.e. SpiderGL.Type.UINT8.
 */
Type.typeFromGL = (function(){
	var typeMap = { };
	typeMap[WebGLRenderingContext.NONE          ] = Type.NO_TYPE;
	typeMap[WebGLRenderingContext.BYTE          ] = Type.INT8;
	typeMap[WebGLRenderingContext.UNSIGNED_BYTE ] = Type.UINT8;
	typeMap[WebGLRenderingContext.SHORT         ] = Type.INT16;
	typeMap[WebGLRenderingContext.UNSIGNED_SHORT] = Type.UINT16;
	typeMap[WebGLRenderingContext.INT           ] = Type.INT32;
	typeMap[WebGLRenderingContext.UNSIGNED_INT  ] = Type.UINT32;
	typeMap[WebGLRenderingContext.FLOAT         ] = Type.FLOAT32;
	return function (glType) {
		return typeMap[glType];
	};
})();

/**
 * Returns the size of the type expressed by the passed WebGL type symbolic constant.
 *
 * @param {number} glType A WebGL type symbolic constants, i.e. WebGLRenderingContext.UNSIGNED_BYTE.
 * @return {number} The size in bytes of the type.
 */
Type.typeSizeFromGL = function (glType) {
	var sglType = Type.typeFromGL(glType);
	return Type.typeSize(sglType);
};

/**
 * Maps a SpiderGL type symbolic constant to a TypedArray constructor.
 * For example, calling this function with SpiderGL.Type.UINT8 as argument will return Uint8Array.
 *
 * @param {number} sglType A SpiderGL type symbolic constants, i.e. SpiderGL.Type.UINT8.
 * @return {function} The corresponding TypedArray constructor function, i.e. Uint8Array.
 */
Type.typeToTypedArrayConstructor = (function(){
	var typeMap = { };
	typeMap[Type.NO_TYPE] = ArrayBuffer;
	typeMap[Type.INT8   ] = Int8Array;
	typeMap[Type.UINT8  ] = Uint8Array;
	typeMap[Type.INT16  ] = Int16Array;
	typeMap[Type.UINT16 ] = Uint16Array;
	typeMap[Type.INT32  ] = Int32Array;
	typeMap[Type.UINT32 ] = Uint32Array;
	typeMap[Type.FLOAT32] = Float32Array;
	return function (sglType) {
		return typeMap[sglType];
	};
})();

Type.POINTS         = 0;
Type.LINES          = 1;
Type.LINE_LOOP      = 2;
Type.LINE_STRIP     = 3;
Type.TRIANGLES      = 4;
Type.TRIANGLE_FAN   = 5;
Type.TRIANGLE_STRIP = 6;

Type.primitiveToGL = (function(){
	var enumMap = { };
	enumMap[Type.POINTS        ] = WebGLRenderingContext.POINTS;
	enumMap[Type.LINES         ] = WebGLRenderingContext.LINES;
	enumMap[Type.LINE_LOOP     ] = WebGLRenderingContext.LINE_LOOP;
	enumMap[Type.LINE_STRIP    ] = WebGLRenderingContext.LINE_STRIP;
	enumMap[Type.TRIANGLES     ] = WebGLRenderingContext.TRIANGLES;
	enumMap[Type.TRIANGLE_FAN  ] = WebGLRenderingContext.TRIANGLE_FAN;
	enumMap[Type.TRIANGLE_STRIP] = WebGLRenderingContext.TRIANGLE_STRIP;
	return function (sglEnum) {
		return enumMap[sglEnum];
	};
})();

/**
 * Tests the instance.
 *
 * The arg is tested to belong to a ctor function constructor.
 *
 * @param {any} arg The object to check.
 * @param {constructor} ctor The class (i.e. the function constructor) that is tested for creating the object.
 * @return {bool} True if arg is an instance of ctor, false otherwise.
 */
Type.instanceOf = function (arg, ctor) {
	return (arg instanceof ctor);
}

/**
 * Tests whether the argument is a number.
 *
 * @param {any} arg The object to check.
 * @return {bool} True if arg is a number, false otherwise.
 */
Type.isNumber = function (arg) {
	return (typeof arg == "number");
}

/**
 * Tests whether the argument is a string.
 *
 * @param {any} arg The object to check.
 * @return {bool} True if arg is a string, false otherwise.
 */
Type.isString = function (arg) {
	return (typeof arg == "string");
}

/**
 * Tests whether the argument is a function.
 *
 * @param {any} arg The object to check.
 * @return {bool} True if arg is a function, false otherwise.
 */
Type.isFunction = function (arg) {
	return (typeof arg == "function");
}

/**
 * Tests whether the argument is an array.
 *
 * @param {any} arg The object to check.
 * @return {bool} True if arg is an array, false otherwise.
 */
Type.isArray = function (arg) {
	return (arg && arg.constructor === Array);
}

/**
 * Tests whether the argument is a typed array.
 *
 * @param {any} arg The object to check.
 * @return {bool} True if arg is a typed array, false otherwise.
 */
Type.isTypedArray = function (arg) {
	return (arg && (typeof arg.buffer != "undefined") && (arg.buffer instanceof ArrayBuffer));
}

/**
 * Implements inheritance.
 *
 * A class derivation is established between derived and base. The derived object can be successfully tested as being a base instance and inherits base properties and methods.
 * It is possible to override base properties and methods by redefining them.
 * This function must be called after assigning the derived prototype object.
 *
 * @param {constructor} derived The derived class.
 * @param {constructor} base The base class.
 *
 * @example
 * function Base(x, y) {
 *   this.x = x;
 *   this.y = y;
 * };
 *
 * Base.prototype = {
 *   alertX : function () { alert("Base X: " + this.x); },
 *   alertY : function () { alert("Base Y: " + this.y); }
 * };
 *
 * function Derived(x, y, z) {
 *   Base.call(this, x, y);
 *   this.z = z;
 * };
 *
 * Derived.prototype = {
 *   alertY : function () { alert("Derived Y: " + this.y); },
 *   alertZ : function () { alert("Derived Z: " + this.z); },
 * };
 *
 * SpiderGL.Type.extend(base, derived);
 *
 * var b = new Base(1, 2);
 * b.alertX(); // alerts "Base X: 1"
 * b.alertY(); // alerts "Base Y: 2"
 *
 * var d = new Base(3, 4, 5);
 * d.alertX(); // alerts "Base X: 3"     (base method is kept)
 * d.alertY(); // alerts "Derived Y: 4"  (base method is overridden)
 * d.alertZ(); // alerts "Derived Y: 5"  (new derived method is called)
 */
Type.extend = function(derived, base /*, installBaseInfo*/) {
	function inheritance() { }
	inheritance.prototype = base.prototype;

	var dproto = derived.prototype;
	var iproto = new inheritance();
	iproto.constructor = derived;

	var getter = null;
	var setter = null;
	for (var p in dproto) {
		getter = dproto.__lookupGetter__(p);
		if (getter) { iproto.__defineGetter__(p, getter); }

		setter = dproto.__lookupSetter__(p);
		if (setter) { iproto.__defineSetter__(p, setter); }

		if (!getter && !setter) { iproto[p] = dproto[p]; }
	}

	derived.prototype = iproto;

	/*
	if (installBaseInfo) {
		derived.superConstructor = base;
		derived.superClass       = base.prototype;
	}
	*/
}

Type.defineClassGetter = function(ctor, name, func) {
	ctor.prototype.__defineGetter__(name, func);
}

Type.defineClassSetter = function(ctor, name, func) {
	ctor.prototype.__defineSetter__(name, func);
}

Type.defineObjectGetter = function(obj, name, func) {
	obj.__defineGetter__(name, func);
}

Type.defineObjectSetter = function(obj, name, func) {
	obj.__defineSetter__(name, func);
}

return Type;

});
