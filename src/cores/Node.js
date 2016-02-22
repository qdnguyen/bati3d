define(['./Cone3s', './Sphere3f', './State'] ,function(Cone3s, Sphere3f, State){
    

var Node = function() {
	this.offset        = 0;
	this.verticesCount = 0;
	this.facesCount    = 0;
	this.error         = 0.0;
	this.cone          = new Cone3s();
	this.sphere        = new Sphere3f();
	this.tightRadius   = 0.0;
	this.firstPatch    = 0;
        this.visible       = false;
	// computed
	this.lastPatch     = 0;
	this.lastByte      = 0;
};

Node.SIZEOF = 2 * Uint32Array.BYTES_PER_ELEMENT + 2 * Uint16Array.BYTES_PER_ELEMENT + 2 * Float32Array.BYTES_PER_ELEMENT + Sphere3f.SIZEOF + Cone3s.SIZEOF;

Node.prototype = {
	get isEmpty() {
		return (this.end == this.outBegin);
	},

	import : function (view, offset, littleEndian) {
		var s = 0;
		this.offset         = State.PADDING * view.getUint32(offset + s, littleEndian);  s += Uint32Array.BYTES_PER_ELEMENT;
		this.verticesCount  = view.getUint16(offset + s, littleEndian);  s += Uint16Array.BYTES_PER_ELEMENT;
		this.facesCount     = view.getUint16(offset + s, littleEndian);  s += Uint16Array.BYTES_PER_ELEMENT;
		this.error          = view.getFloat32(offset + s, littleEndian); s += Float32Array.BYTES_PER_ELEMENT;
		s                  += this.cone.import(view, offset + s, littleEndian);
		s                  += this.sphere.import(view, offset + s, littleEndian);
		this.tightRadius    = view.getFloat32(offset + s, littleEndian); s += Float32Array.BYTES_PER_ELEMENT;
		this.firstPatch     = view.getUint32(offset + s, littleEndian);  s += Uint32Array.BYTES_PER_ELEMENT;
		return s;
	},
        addOffsetToSphere : function(header){
               this.sphere.center.x +=header.offsetX;
               this.sphere.center.y +=header.offsetY;
               this.sphere.center.z +=header.offsetZ;
        }        
};

return Node;
});
