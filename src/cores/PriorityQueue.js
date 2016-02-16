define(function(){
// takes an array of objects with {data, priority}
var PriorityQueue = function() {
	this.content = [];
};

PriorityQueue.prototype = {
	push: function(node) {
		this.bubbleUp(this.content.push(node) -1);
	},
	pop: function() {
		var result = this.content[0];    
		var end = this.content.pop();
		if (this.content.length > 0) {
			this.content[0] = end;
			this.sinkDown(0);
		}
		return result;
	},
	size: function() { return this.content.length; },
	bubbleUp: function(n) {
		var element = this.content[n];
		while (n > 0) {
			var parentN = ((n+1)>>1) -1; 
                        console.log(parent)
			var parent = this.content[parentN];
			if(parent.node.renderError > element.node.renderError)
				break;
			this.content[parentN] = element;
			this.content[n] = parent;
			n = parentN;
		}
	},

	sinkDown: function(n) {
		var length = this.content.length;
		var element = this.content[n]

		while(true) {
			var child2N = (n + 1) * 2;
			var child1N = child2N - 1;
			var swap = null;
      		if (child1N < length) {
				var child1 = this.content[child1N];
				if(child1.node.renderError > element.node.renderError)
					swap = child1N;
			}
			if (child2N < length) {
				var child2 = this.content[child2N];
				if (child2.node.renderError > (swap == null ? element.node.renderError : child1.node.renderError))
					swap = child2N;
			}

			if (swap == null) break;

			this.content[n] = this.content[swap];
			this.content[swap] = element;
			n = swap;
		}
	}
};

return PriorityQueue;

});