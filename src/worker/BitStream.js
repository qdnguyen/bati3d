//	actually bitstreams expects a little endian uin64 type. convert it to 2 uint32

//define(function(){
    

var BitStream = function(array) { 
	this.a = array;
	for(var i = 0; i < array.length; i += 2) {
		var s = array[i];
		array[i] = array[i+1];
		array[i+1] = s;
	}
	this.position = 0;
	this.bitsPending = 0;
};
 
BitStream.prototype = { 
	read: function(bits) {
		var bitBuffer = 0;
		while(bits > 0) {
			var partial;
			var bitsConsumed;
			if (this.bitsPending > 0) {
				var byte = (this.a[this.position - 1] & (0xffffffff >>> (32 - this.bitsPending)))>>>0;
				bitsConsumed = Math.min(this.bitsPending, bits);
				this.bitsPending -= bitsConsumed;
				partial = byte >>> this.bitsPending;
			} else {
				bitsConsumed = Math.min(32, bits);
				this.bitsPending = 32 - bitsConsumed;
				partial = this.a[this.position++] >>> this.bitsPending;
			}
			bits -= bitsConsumed;
			bitBuffer = ((bitBuffer << bitsConsumed) | partial)>>>0;
		}
		return bitBuffer; 
	},
	replace: function(bits, value) {
		//zero last part
		value = (value & (0xffffffff >>> 32 - bits)) >>> 0;
		value = (value | read(bits)) >>> 0;
		return value;
	}
};

//return BitStream;

//});
