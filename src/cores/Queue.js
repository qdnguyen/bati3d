/* queue FIFO 
 * rewrite and enrich code from http://code.stephenmorley.org/javascript/queues
 */

define(function(){     

var Queue = function(){

  // initialise the queue and offset
  this._queue  = [];
  this._offset = 0;
  this._length = 0;
  
};

// Returns the length of the queue.
Queue.prototype.getLength = function(){
        return this._length;
};

// Returns true if the queue is empty, and false otherwise.
Queue.prototype.isEmpty = function(){
        return (this._length === 0);
};

/* Enqueues the specified item. The parameter is:
 *
 * item - the item to enqueue
 */
Queue.prototype.enqueue = function(item){
        this._queue.push(item);
        this._length++;
};

/* Dequeues an item and returns it. If the queue is empty, the value
* 'undefined' is returned.
*/

Queue.prototype.dequeue = function() {
        if (this._length === 0) {
            return undefined;
        }

        var queue = this._queue;
        var offset = this._offset;
        var item = queue[offset];
        queue[offset] = undefined;

        offset++;
        if (offset > 10 && offset * 2 > queue.length) {
            //queue.pop()
            this._queue = queue.slice(offset);
            offset = 0;
        }

        this._offset = offset;
        this._length--;

        return item;
};

/* Returns the item at the front of the queue (without dequeuing it). If the
   * queue is empty then undefined is returned.
   */
Queue.prototype.peek = function(){
        return (this._queue.length > 0 ? this._queue[this._offset] : undefined);
};

/**
 * Check whether this queue contains the specified item.
 *
 */

Queue.prototype.contains = function(item) {
        return this._queue.indexOf(item) !== -1;
};

/**
  * Remove all items from the queue.
  */
Queue.prototype.clear = function() {
        this._queue.length = this._offset = this._length = 0;
};

/**
 * Sort the items in the queue in-place.
 */
Queue.prototype.sort = function(compareFunction) {
        if (this._offset > 0) {
            //compact array
            this._queue = this._queue.slice(this._offset);
            this._offset = 0;
        }

        this._queue.sort(compareFunction);
};

    return Queue;
});