define(['THREE'], function(THREE){
    

var Sphere3f = function () {
        THREE.Sphere.call(this);
};
Sphere3f.prototype = Object.create(THREE.Sphere.prototype);
Sphere3f.prototype.constructor = Sphere3f;

Sphere3f.SIZEOF = 4 * Float32Array.BYTES_PER_ELEMENT;

Sphere3f.prototype = {
	import : function (view, offset, littleEndian) {
		var s = 0;
                var array = new Array(3);
		for (var i=0; i<3; ++i) {
			array[i] = view.getFloat32(offset + s, littleEndian);
			s += Float32Array.BYTES_PER_ELEMENT;
		}
                this.center.set(array[0],array[1],array[2]);
 		this.radius = view.getFloat32(offset + s, littleEndian); s += Float32Array.BYTES_PER_ELEMENT;
		return s;
	}
};

return Sphere3f;
});