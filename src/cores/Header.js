define(['./Signature', './Sphere3f'] ,function(Signature, Sphere3f){
    
    

var Header = function () {
	this.reset();
};

Header.SIZEOF = 5 * Uint32Array.BYTES_PER_ELEMENT + 2 * 2 * Uint32Array.BYTES_PER_ELEMENT + Signature.SIZEOF + Sphere3f.SIZEOF + 3*Float64Array.BYTES_PER_ELEMENT;
Header.MAGIC  = 0x4E787320;

Header.prototype = {
	_getUint64 : function (view, offset, littleEndian) {
		var s = 0;
		var lo = view.getUint32(offset + s, littleEndian); s += Uint32Array.BYTES_PER_ELEMENT;
		var hi = view.getUint32(offset + s, littleEndian); s += Uint32Array.BYTES_PER_ELEMENT;
		return ((hi * (1 << 32)) + lo);
	},

	get isValid() {
		return (this.version > 0);
	},

	reset : function () {
		this.magic         = 0;
		this.version       = 0;
		this.verticesCount = 0;
		this.facesCount    = 0;
		this.signature     = new Signature();
		this.nodesCount    = 0;
		this.patchesCount  = 0;
		this.texturesCount = 0;
		this.sphere        = new Sphere3f();
	},

	import : function (view, offset, littleEndian) {
		this.reset();

		var s = 0;

		this.magic          = view.getUint32(offset + s, littleEndian);               s += Uint32Array.BYTES_PER_ELEMENT;
		if (this.magic != Header.MAGIC) return 0;

		this.version        = view.getUint32(offset + s, littleEndian);               s += Uint32Array.BYTES_PER_ELEMENT;
		this.verticesCount  = this._getUint64(view, offset + s, littleEndian);        s += Uint32Array.BYTES_PER_ELEMENT * 2;
		this.facesCount     = this._getUint64(view, offset + s, littleEndian);        s += Uint32Array.BYTES_PER_ELEMENT * 2;
		s                  += this.signature.import(view, offset + s, littleEndian);
		this.nodesCount     = view.getUint32(offset + s, littleEndian);               s += Uint32Array.BYTES_PER_ELEMENT;
		this.patchesCount   = view.getUint32(offset + s, littleEndian);               s += Uint32Array.BYTES_PER_ELEMENT;
		this.texturesCount  = view.getUint32(offset + s, littleEndian);               s += Uint32Array.BYTES_PER_ELEMENT;
		s                  += this.sphere.import(view, offset + s, littleEndian);
                this.offsetX        = view.getFloat64(offset + s,littleEndian);               s += Float64Array.BYTES_PER_ELEMENT;
                this.offsetY        = view.getFloat64(offset + s,littleEndian);               s += Float64Array.BYTES_PER_ELEMENT;
                this.offsetZ        = view.getFloat64(offset + s,littleEndian);               s += Float64Array.BYTES_PER_ELEMENT;
		return s;
	}
};

return Header;

});