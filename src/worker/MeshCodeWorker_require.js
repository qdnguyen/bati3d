//web worker does not work well inside of requirejs
// if we put onmessage function inside callback of define function
// it can not recognized this 

importScripts('require.js');

require({
        baseUrl: '../' //go out because we are in lib directory
    },
    ["worker/MeshCoder"],
    function(MeshCoder) {
        
        postMessage("in require");
  
        this.onmessage = function(job) {
            
            postMessage("received something");
            
            switch (job.data.status) {
                case "processing":
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
                    
                    break;
            }
        };
});

//importScripts('require.js');
