//define(['worker/BitStream'],function(BitStream){
    
var Stream = function(buffer) {
	this.data = buffer;
	this.buffer = new Uint8Array(buffer);
	this.pos = 0;
}

Stream.prototype = {
	readChar: function() {
		var c = this.buffer[this.pos++];
		if(c > 127) c -= 256;
		return c;
	},
	readUChar: function() {
		return this.buffer[this.pos++];
	},	
	readInt: function() {
		var c = this.buffer[this.pos + 3]
		c <<= 8;
		c |= this.buffer[this.pos + 2];
		c <<= 8;
		c |= this.buffer[this.pos + 1];
		c <<= 8;
		c |= this.buffer[this.pos + 0];
		this.pos += 4;
		return c;
	},
	readArray: function(n) {
		var a = this.buffer.subarray(this.pos, this.pos+n);
		this.pos += n;
		return a;
	},
	readBitStream:function() {
		var n = this.readInt();
		var pad = this.pos & 0x3;
		if(pad != 0)
			this.pos += 4 - pad;
		var b = new BitStream(new Uint32Array(this.data, this.pos, n*2));
		this.pos += n*8;
		return b;
	}
};

//return Stream;

//});
