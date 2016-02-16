define(['./Patch'] ,function(Patch){

var PatchIndex = function() {
	this.items = [ ];
};

PatchIndex.prototype = {
	get length() {
		return this.items.length;
	},

	import : function (patchesCount, view, offset, littleEndian) {
		this.items = new Array(patchesCount);
		var s = 0;
		for (var i=0; i<patchesCount; ++i) {
			var patch = new Patch();
			s += patch.import(view, offset + s, littleEndian);
			this.items[i] = patch;
		}
		return s;
	}
};

return PatchIndex;

});