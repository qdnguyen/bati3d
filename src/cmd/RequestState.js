define(function(){
   var RequestState = {
       NONE      : 0,
       ONGOING   : 1,
       CANCELLED : 2,
       FAILED    : 3,
       SUCCEEDED : 4,

       DEFAULT_ASYNC : true,
       DEFAULT_SEND  : true
   }; 
   
   return RequestState;
    
});


