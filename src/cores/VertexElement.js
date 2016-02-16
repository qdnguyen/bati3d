define(['./Type', './Element', './Attribute' ],function(Type, Element, Attribute){
    

var VertexElement = function () {
	Element.call(this);
};

VertexElement.SIZEOF = Element.SIZEOF;

VertexElement.POSITION  = 0;
VertexElement.NORMAL    = 1;
VertexElement.COLOR     = 2;
VertexElement.TEXCOORD  = 3;
VertexElement.DATA0     = 4;

VertexElement.prototype = {
	get hasPosition () { return !this.attributes[VertexElement.POSITION].isNull; },
	get hasNormal   () { return !this.attributes[VertexElement.NORMAL  ].isNull; },
	get hasColor    () { return !this.attributes[VertexElement.COLOR   ].isNull; },
	get hasTexCoord () { return !this.attributes[VertexElement.TEXCOORD].isNull; },

	hasData : function (i) { return !this.attributes[VertexElement.DATA0 + i].isNull; },

	import : function (view, offset, littleEndian) {
		var r = Element.prototype.import.apply(this, arguments);
		var color = this.attributes[VertexElement.COLOR];
		if (!color.isNull) {
			if (color.type == Attribute.BYTE) {
				color.type   = Attribute.UNSIGNED_BYTE;
				color.glType = Attribute._typeGLMap[color.type];
			}
		}
		return r;
	}
};

Type.extend(VertexElement, Element);

return VertexElement;

});
