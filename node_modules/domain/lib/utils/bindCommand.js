module.exports = function(bus,cmds,handles){
	for(var k in cmds){
		bus.bind(k,handles[k]);
	}
}
