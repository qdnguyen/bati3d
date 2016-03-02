define(['./Element', './Attribute' ],function(Element, Attribute){
    

var VertexElement = function () {
	Element.call(this);
};
VertexElement.prototype = Object.create(Element.prototype);
VertexElement.prototype.constructor = VertexElement;

VertexElement.SIZEOF = Element.SIZEOF;

VertexElement.POSITION  = 0;
VertexElement.NORMAL    = 1;
VertexElement.COLOR     = 2;
VertexElement.TEXCOORD  = 3;
VertexElement.DATA0     = 4;

VertexElement.prototype.hasPosition = function() { return !this.attributes[VertexElement.POSITION].isNull(); },
VertexElement.prototype.hasNormal   = function() { return !this.attributes[VertexElement.NORMAL  ].isNull(); },
VertexElement.prototype.hasColor    = function() { return !this.attributes[VertexElement.COLOR   ].isNull(); },
VertexElement.prototype.hasTexCoord = function() { return !this.attributes[VertexElement.TEXCOORD].isNull(); },

VertexElement.prototype.hasData = function (i) { return !this.attributes[VertexElement.DATA0 + i].isNull(); },

VertexElement.prototype.import = function (view, offset, littleEndian) {
		var r = Element.prototype.import.apply(this, arguments);
		var color = this.attributes[VertexElement.COLOR];
		if (!color.isNull()) {
			if (color.type == Attribute.BYTE) {
				color.type   = Attribute.UNSIGNED_BYTE;
				color.glType = Attribute._typeGLMap[color.type];
			}
		}
		return r;
}

//Type.extend(VertexElement, Element);

return VertexElement;

});
