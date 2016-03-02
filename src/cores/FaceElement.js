define(['./Element', './Attribute'], function(Element, Attribute){

var FaceElement = function () {
	Element.call(this);
};
FaceElement.prototype = Object.create(Element.prototype);
FaceElement.prototype.constructor = FaceElement;

FaceElement.SIZEOF = Element.SIZEOF;

FaceElement.INDEX    = 0;
FaceElement.NORMAL   = 1;
FaceElement.COLOR    = 2;
FaceElement.TEXCOORD = 3;
FaceElement.DATA0    = 4;


FaceElement.prototype.hasIndex    = function() { return !this.attributes[FaceElement.INDEX   ].isNull(); };
FaceElement.prototype.hasNormal   = function() { return !this.attributes[FaceElement.NORMAL  ].isNull(); };
FaceElement.prototype.hasColor    = function() { return !this.attributes[FaceElement.COLOR   ].isNull(); };
FaceElement.prototype.hasTexCoord = function() { return !this.attributes[FaceElement.TEXCOORD].isNull(); };

FaceElement.prototype.hasData = function (i) { return !this.attributes[FaceElement.DATA0 + i].isNull(); };

FaceElement.prototype.import = function (view, offset, littleEndian) {
		var r = Element.prototype.import.apply(this, arguments);
		var color = this.attributes[FaceElement.COLOR];
		if (!color.isNull()) {
			if (color.type == Attribute.BYTE) {
				color.type   = Attribute.UNSIGNED_BYTE;
				color.glType = Attribute._typeGLMap[color.type];
			}
		}
		return r;
};

//Type.extend(FaceElement, Element);
return FaceElement;
    
});