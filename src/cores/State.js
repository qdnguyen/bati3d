define(function(){
    
var State = {
                    STATUS_NONE    : 0,
                    STATUS_OPENING : 1,
                    STATUS_OPEN    : 2,

                    DEFAULT_TARGET_ERROR         : .1,
                    DEFAULT_TARGET_FPS           : 20,
                    DEFAULT_MAX_PENDING_REQUESTS : 6, // 3 is good for uncompressed online work
                    DEFAULT_CACHE_SIZE           : 256 * 1024 * 1024,
                    DEFAULT_DRAW_BUDGET          : 2.0 * 1024 * 1024,

                    _NODE_NONE    : 0,
                    _NODE_PENDING : 1,
                    _NODE_READY   : 2,
                    
                    LITTLE_ENDIAN_DATA : true,
                    PADDING            : 256
                };

return State;
});