module.exports = function bindEvnetHandle(handles,bus){
	for(var k in handles){
		bus.on(k,handles[k]);
	}	
}