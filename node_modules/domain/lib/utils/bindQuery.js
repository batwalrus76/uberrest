module.exports = function(bus,queries,handles){
	for(var k in queries){
		bus.bind(k,handles[k]);
	}
}

