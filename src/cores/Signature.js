define(['./VertexElement', './FaceElement'], function(VertexElement, FaceElement){
    

var Signature = function () {
	this.vertex = new VertexElement();
	this.face   = new FaceElement();
	this.flags  = Signature.UNCOMPRESSED;
};

Signature.SIZEOF = VertexElement.SIZEOF + FaceElement.SIZEOF + Uint32Array.BYTES_PER_ELEMENT;

Signature.PTEXTURE = (1 << 0);
Signature.MECO     = (1 << 1);
Signature.CTM1     = (1 << 2);
Signature.CTM2     = (1 << 3);

Signature.prototype = {
	import : function (view, offset, littleEndian) {
		var s = 0;
		s += this.vertex.import(view, offset + s, littleEndian);
		s += this.face.import(view, offset + s, littleEndian);
		this.flags = view.getUint32(offset + s, littleEndian); s += Uint32Array.BYTES_PER_ELEMENT;
		return s;
	}
};

return Signature;
});