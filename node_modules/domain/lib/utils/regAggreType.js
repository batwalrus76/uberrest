var extend = require('node-extend');
var EventStore = require('../EventStore');
var Repository = require('../Repository');
var Aggre = require('../Aggre');

module.exports = function regAggreType(repos,aggreTypes,aggreType,Store,eventBus){

	aggreTypes[aggreType.name] = extend(aggreType,Aggre);
	var es  =  new EventStore(aggreType.name,new Store(aggreType.name));
	var r = new Repository(aggreTypes[aggreType.name],es,eventBus);
	repos[aggreType.name] = r;

}