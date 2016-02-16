//define(function(){
    

var Tunstall = function (wordsize, lookup_size) {
	this.wordsize = wordsize? wordsize : 8;
	this.lookup_size = lookup_size? lookup_size : 8;
};

Tunstall.prototype = {
	decompress: function(stream) {
		var nsymbols = stream.readUChar();
		this.probabilities = stream.readArray(nsymbols*2);
		this.createDecodingTables();
		var size = stream.readInt();
		var data = new Uint8Array(size);
		var compressed_size = stream.readInt();
		var compressed_data = stream.readArray(compressed_size);
		if(size)
			this._decompress(compressed_data, compressed_size, data, size);
		return data;
	}, 

	createDecodingTables: function() {
		//read symbol,prob,symbol,prob as uchar.
		//Here probabilities will range from 0 to 0xffff for better precision

		var n_symbols = this.probabilities.length/2;
		if(n_symbols <= 1) return;

		var queues = []; //array of arrays
		var buffer = []; 

		//initialize adding all symbols to queues
		for(var i = 0; i < n_symbols; i++) {
			var symbol = this.probabilities[i*2];
			var s = [(this.probabilities[i*2+1])<<8, buffer.length, 1]; //probability, position in the buffer, length
			queues[i] = [s];
			buffer.push(this.probabilities[i*2]); //symbol
		}
		var dictionary_size = 1<<this.wordsize;
		var n_words = n_symbols;
		var table_length = n_symbols;

		//at each step we grow all queues using the most probable sequence
		while(n_words < dictionary_size - n_symbols +1) {
			//Should use a stack or something to be faster, but we have few symbols
			//find highest probability word
			var best = 0;
			var max_prob = 0;
			for(var i = 0; i < n_symbols; i++) {
				var p = queues[i][0][0]; //front of queue probability.
				if(p > max_prob) {
					best = i;
					max_prob = p;
				}
			}
			var symbol = queues[best][0];
			var pos = buffer.length;
			
			for(var i = 0; i < n_symbols; i++) {
				var sym = this.probabilities[i*2];
				var prob = this.probabilities[i*2+1]<<8;
				var s = [((prob*symbol[0])>>>16), pos, symbol[2]+1]; //combine probabilities, keep track of buffer, keep length of queue

				for(var k  = 0; k < symbol[2]; k++)
					buffer[pos+k] = buffer[symbol[1] + k]; //copy sequence of symbols

				pos += symbol[2];
				buffer[pos++] = sym; //append symbol
				queues[i].push(s);
			}
			table_length += (n_symbols-1)*(symbol[2] + 1) +1; 
			n_words += n_symbols -1;
			queues[best].shift(); //remove first thing
		}

		this.index = new Uint32Array(n_words);
		this.lengths = new Uint32Array(n_words);
		this.table = new Uint8Array(table_length);
		var word = 0;
		var pos = 0;
		for(i = 0; i < queues.length; i++) {
			var queue = queues[i];
			for(var k = 0; k < queue.length; k++) {
				var s = queue[k];
				this.index[word] = pos;
				this.lengths[word] = s[2]; //length
				word++;

				for(var j = 0; j < s[2]; j++)
					this.table[pos + j] = buffer[s[1] + j]; //buffer of offset
				pos += s[2]; //length
			}
		}
	},
	_decompress: function(input, input_size, output, output_size) {
		var input_pos = 0;
		var output_pos = 0;
		if(this.probabilities.length == 2) {
			var symbol = this.probabilities[0];
			for(var i = 0; i < output_size; i++)
				output[i] = symbol;
			return;
		}

		while(input_pos < input_size-1) {
			var symbol = input[input_pos++];
			var start = this.index[symbol];
			var end = start + this.lengths[symbol];
			for(var i = start; i < end; i++) 
				output[output_pos++] = this.table[i];
		}

		//last symbol might override so we check.
		var symbol = input[input_pos];
		var start = this.index[symbol];
		var end = start + output_size - output_pos;
		var length = output_size - output_pos;
		for(var i = start; i < end; i++)
			output[output_pos++] = this.table[i];

		return output;
	}
};


//return Tunstall;
//});
