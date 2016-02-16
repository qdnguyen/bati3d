define(function(){
    
var Cone3s = function () {
	this.n = [0, 0, 0, 0];
};

Cone3s.SIZEOF = 4 * Uint16Array.BYTES_PER_ELEMENT;

Cone3s.prototype = {
	backFace : function (sphere, view) {
		var n = this.n;

		var norm = [n[0] / 32766.0, n[1] / 32766.0, n[2] / 32766.0];
		var d = [0.0, 0.0, 0.0];
		var f = 0.0;
		var dd = 0.0;

		for (var i=0; i<3; ++i) {
			d[i] = (sphere.center[i] - norm[i] * sphere.radius) - view[i];
			norm[i] *= n[3] / 32766.0;
			f += d[i] * norm[i];
			dd = d[i] * d[i];
		}

		return !((f < 0.001) || ((f * f) < dd));
	},

	frontFace : function (sphere, view) {
		var n = this.n;

		var norm = [n[0] / 32766.0, n[1] / 32766.0, n[2] / 32766.0];
		var d = [0.0, 0.0, 0.0];
		var f = 0.0;
		var dd = 0.0;

		for (var i=0; i<3; ++i) {
			d[i] = (sphere.center[i] + norm[i] * sphere.radius) - view[i];
			norm[i] *= n[3] / 32766.0;
			f += -d[i] * norm[i];
			dd = d[i] * d[i];
		}

		return !((f < 0.001) || ((f * f) < dd));
	},

	import : function (view, offset, littleEndian) {
		var s = 0;
		for (var i=0; i<4; ++i) {
			this.n[i] = view.getInt16(offset + s, littleEndian);
			s += Uint16Array.BYTES_PER_ELEMENT;
		}
		return s;
	}
};

return Cone3s;
});
