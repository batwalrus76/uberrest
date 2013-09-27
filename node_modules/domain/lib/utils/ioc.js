module.exports = function(Funs,domain){
	for(var k in Funs){
		Funs[k].prototype.domain = domain;
	}
}
