define(function(){
    

var Patch = function() {
	this.node         = 0;
	this.lastTriangle = 0;
	this.texture      = 0;
};

Patch.SIZEOF = 3 * Uint32Array.BYTES_PER_ELEMENT;

Patch.prototype = {
	import : function (view, offset, littleEndian) {
		var s = 0;
		this.node           = view.getUint32(offset + s, littleEndian); s += Uint32Array.BYTES_PER_ELEMENT;
		this.lastTriangle   = view.getUint32(offset + s, littleEndian); s += Uint32Array.BYTES_PER_ELEMENT;
		this.texture        = view.getUint32(offset + s, littleEndian); s += Uint32Array.BYTES_PER_ELEMENT;
		return s;
	}
};

return Patch;
});