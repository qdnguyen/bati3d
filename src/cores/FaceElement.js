define(['./Type', './Element', './Attribute'], function(Type, Element, Attribute){

var FaceElement = function () {
	Element.call(this);
};


FaceElement.SIZEOF = Element.SIZEOF;

FaceElement.INDEX    = 0;
FaceElement.NORMAL   = 1;
FaceElement.COLOR    = 2;
FaceElement.TEXCOORD = 3;
FaceElement.DATA0    = 4;

FaceElement.prototype = {
	get hasIndex    () { return !this.attributes[FaceElement.INDEX   ].isNull; },
	get hasNormal   () { return !this.attributes[FaceElement.NORMAL  ].isNull; },
	get hasColor    () { return !this.attributes[FaceElement.COLOR   ].isNull; },
	get hasTexCoord () { return !this.attributes[FaceElement.TEXCOORD].isNull; },

	hasData : function (i) { return !this.attributes[FaceElement.DATA0 + i].isNull; },

	import : function (view, offset, littleEndian) {
		var r = Element.prototype.import.apply(this, arguments);
		var color = this.attributes[FaceElement.COLOR];
		if (!color.isNull) {
			if (color.type == Attribute.BYTE) {
				color.type   = Attribute.UNSIGNED_BYTE;
				color.glType = Attribute._typeGLMap[color.type];
			}
		}
		return r;
	}
};

Type.extend(FaceElement, Element);
return FaceElement;
    
});