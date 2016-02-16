define(function(){
    

var Texture = function() {
	this.offset   = 0;
	this.matrix   = new Array(16);

	// computed
	this.lastByte = 0;
};

Texture.SIZEOF = 1 * Uint32Array.BYTES_PER_ELEMENT + 16 * Float32Array.BYTES_PER_ELEMENT;

Texture.prototype = {
	import : function (view, offset, littleEndian) {
		var s = 0;
		this.offset = view.getUint32(offset + s, littleEndian); s += Uint32Array.BYTES_PER_ELEMENT;
		for (var i=0; i<16; ++i) {
			this.matrix[i] = view.getFloat32(offset + s, littleEndian); s += Float32Array.BYTES_PER_ELEMENT;
		}
		return s;
	}
};

return Texture;

});
