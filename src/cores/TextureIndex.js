define(function(){
var TextureIndex = function() {
	this.items = [ ];
};

TextureIndex.prototype = {
	get length() {
		return this.items.length;
	},

	import : function (texturesCount, view, offset, littleEndian) {
		this.items = new Array(texturesCount);
		var s = 0;
		for (var i=0; i<texturesCount; ++i) {
			var texture = new Texture();
			s += texture.import(view, offset + s, littleEndian);
			this.items[i] = texture;
		}
		for (var i=0; i<(texturesCount-1); ++i) {
			var currTex = this.items[i];
			var nextTex = this.items[i+1];
			currTex.lastByte = nextTex.offset - 1;
		}
		return s;
	}
};

return TextureIndex;

});