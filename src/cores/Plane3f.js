define(['THREE'], function(THREE){

var Plane3f = function (p0, p1, p2) {
        this._normal = (new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(p1,p0), new THREE.Vector3().subVectors(p2,p0))).normalize ();
	this._offset = this._normal.dot(p0);
};

Plane3f.prototype = {
	get normal() {
		//return this._normal.slice();
                return this._normal;
	},

	get offset() {
		return this._offset;
	},

	signedDistanceToPoint : function (p) {
		return (this._normal.dot(p) - this._offset);
	}
};

return Plane3f;

});
