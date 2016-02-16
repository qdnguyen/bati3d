define(['./Attribute'],function(Attribute){
    

var Element = function () {
	this.attributes = new Array(8);
	for (var i=0; i<8; ++i) {
		this.attributes[i] = new Attribute();
	}
	this.lastAttribute = -1;
};

Element.prototype = {
	get byteLength() {
		var s = 0;
		for (var i=0; i<this.attributes.length; ++i) {
			s += this.attributes[i].byteLength;
		}
		return s;
	},

	import : function (view, offset, littleEndian) {
		var s = 0;
		for (var i=0; i<this.attributes.length; ++i) {
			var attrib = this.attributes[i];
			s += attrib.import(view, offset + s, littleEndian);

			if (!attrib.isNull) {
				this.lastAttribute = i;
			}
		}
		return s;
	}
};

Element.SIZEOF = 8 * Attribute.SIZEOF;

return Element;

});
