define(function(){
    
var getDefaultObject = function (defaultObj, obj) {
	if (obj) {
		var sDefault = {};
		for (var p in obj) {
                        if (obj[p] !== sDefault) {
				defaultObj[p] = obj[p];
			}
		}
	}
	return defaultObj;
};

return getDefaultObject;

});
