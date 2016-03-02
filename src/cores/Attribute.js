define(function(){
    

var Attribute = function () {
	this.size       = 0;
	this.type       = Attribute.NONE;
	this.glType     = Attribute._typeGLMap[this.type];
	this.normalized = Attribute._typeNormalized[this.type];
	this.stride     = 0;
	this.offset     = 0;
};

Attribute.NONE           = 0;
Attribute.BYTE           = 1;
Attribute.UNSIGNED_BYTE  = 2;
Attribute.SHORT          = 3;
Attribute.UNSIGNED_SHORT = 4;
Attribute.INT            = 5;
Attribute.UNSIGNED_INT   = 6;
Attribute.FLOAT          = 7;
Attribute.DOUBLE         = 8;

Attribute._typeSizeMap = { };
Attribute._typeSizeMap[Attribute.NONE          ] = 0;
Attribute._typeSizeMap[Attribute.BYTE          ] = 1;
Attribute._typeSizeMap[Attribute.UNSIGNED_BYTE ] = 1;
Attribute._typeSizeMap[Attribute.SHORT         ] = 2;
Attribute._typeSizeMap[Attribute.UNSIGNED_SHORT] = 2;
Attribute._typeSizeMap[Attribute.INT           ] = 4;
Attribute._typeSizeMap[Attribute.UNSIGNED_INT  ] = 4;
Attribute._typeSizeMap[Attribute.FLOAT         ] = 4;
Attribute._typeSizeMap[Attribute.DOUBLE        ] = 8;

Attribute._typeGLMap = { };
Attribute._typeGLMap[Attribute.NONE          ] = WebGLRenderingContext.NONE;
Attribute._typeGLMap[Attribute.BYTE          ] = WebGLRenderingContext.BYTE;
Attribute._typeGLMap[Attribute.UNSIGNED_BYTE ] = WebGLRenderingContext.UNSIGNED_BYTE;
Attribute._typeGLMap[Attribute.SHORT         ] = WebGLRenderingContext.SHORT;
Attribute._typeGLMap[Attribute.UNSIGNED_SHORT] = WebGLRenderingContext.UNSIGNED_SHORT;
Attribute._typeGLMap[Attribute.INT           ] = WebGLRenderingContext.INT;
Attribute._typeGLMap[Attribute.UNSIGNED_INT  ] = WebGLRenderingContext.UNSIGNED_INT;
Attribute._typeGLMap[Attribute.FLOAT         ] = WebGLRenderingContext.FLOAT;
Attribute._typeGLMap[Attribute.DOUBLE        ] = WebGLRenderingContext.DOUBLE;

Attribute._typeNormalized = { };
Attribute._typeNormalized[Attribute.NONE          ] = true;
Attribute._typeNormalized[Attribute.BYTE          ] = true;
Attribute._typeNormalized[Attribute.UNSIGNED_BYTE ] = true;
Attribute._typeNormalized[Attribute.SHORT         ] = true;
Attribute._typeNormalized[Attribute.UNSIGNED_SHORT] = true;
Attribute._typeNormalized[Attribute.INT           ] = true;
Attribute._typeNormalized[Attribute.UNSIGNED_INT  ] = true;
Attribute._typeNormalized[Attribute.FLOAT         ] = false;
Attribute._typeNormalized[Attribute.DOUBLE        ] = false;


Attribute.prototype.isNull = function() {
		return (this.type == Attribute.NONE);
	};

Attribute.prototype.getByteLength = function() {
		return (Attribute._typeSizeMap[this.type] * this.size);
	};

Attribute.prototype.import = function (view, offset, littleEndian) {
		var s = 0;
		this.type = view.getUint8(offset + s, littleEndian); s += Uint8Array.BYTES_PER_ELEMENT;
		this.size = view.getUint8(offset + s, littleEndian); s += Uint8Array.BYTES_PER_ELEMENT;

		this.glType     = Attribute._typeGLMap[this.type];
		this.normalized = Attribute._typeNormalized[this.type];
		this.stride     = Attribute._typeSizeMap[this.type] * this.size;
		this.offset     = 0;

		return s;
	};

Attribute.SIZEOF = 2 * Uint8Array.BYTES_PER_ELEMENT;

return Attribute;

});
