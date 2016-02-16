//import modules synch because require's async does not work well in worker

importScripts('ZPoint.js');
importScripts('BitStream.js');
importScripts('Stream.js');
importScripts('Tunstall.js');
importScripts('MeshCoder.js');


onmessage = function(job) {
	if(typeof(job.data) == "string") return;
	var node = job.data.node;
	var signature = job.data.signature;
	var patches = job.data.patches;
	var now =new Date().getTime();

	var size = node.buffer.byteLength;
	var buffer;
	for(var i =0 ; i < 1; i++) {
		var coder = new MeshCoder(signature, node, patches);
		buffer = coder.decode(node.buffer);
	}
	node.buffer = buffer;
	var elapsed = new Date().getTime() - now;
	var t = node.nface;
	console.log("Z Time: " + elapsed + " Size: " + size + " KT/s " + (t/(elapsed)) + " Mbps " + (8*1000*node.buffer.byteLength/elapsed)/(1<<20));
	postMessage(node);
};