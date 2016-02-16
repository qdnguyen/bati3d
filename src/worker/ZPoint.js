//define(function(){
    
var ZPoint = function(h, l) {
	this.lo = l;
	this.hi = h;
};

ZPoint.prototype = {
	copy: function(z) {
		this.lo = z.lo;
		this.hi = z.hi;
	},
	setBit: function(d) {
		if(d < 32)
			this.lo = (this.lo | (1<<d))>>>0;
		else
			this.hi = (this.hi | (1<<(d-32)))>>>0;
	},
	toPoint: function(min, step, buffer, pos) {
		var x = this.morton3(this.lo, this.hi>>>1);
		var y = this.morton3(this.lo>>>1, this.hi>>>2);
		var z = this.morton3((this.lo>>>2 | (this.hi & 0x1)<<30 )>>>0, this.hi>>>3); //first hi bit needs to go into low.

		buffer[pos+0] = (x + min[0])*step;
		buffer[pos+1] = (y + min[1])*step;
		buffer[pos+2] = (z + min[2])*step;
	},
	morton3: function(lo, hi) {
		lo = ( lo                & 0x49249249)>>>0;
                lo = ((lo | (lo >>> 2 )) & 0xc30c30c3)>>>0;
                lo = ((lo | (lo >>> 4 )) & 0x0f00f00f)>>>0;
                lo = ((lo | (lo >>> 8 )) & 0xff0000ff)>>>0;
                lo = ((lo | (lo >>> 16)) & 0x0000ffff)>>>0;

		hi = ( hi                & 0x49249249)>>>0;
                hi = ((hi | (hi >> 2 ))  & 0xc30c30c3)>>>0;
                hi = ((hi | (hi >> 4 ))  & 0x0f00f00f)>>>0;
                hi = ((hi | (hi >> 8 ))  & 0xff0000ff)>>>0;
                hi = ((hi | (hi >> 16))  & 0x0000ffff)>>>0;

		return ((hi<<11) | lo)>>>0;
	}
};

//return ZPoint;
//});
