var Aggre = require('../Aggre');
var extend = require('node-extend');

module.exports = function extendAggre(Aggres,domain){
	Aggre.prototype.domain = domain;
	for(var k in Aggres){
		Aggres[k] = extend(Aggres[k],Aggre,extend.EXTEND);
	}
}
