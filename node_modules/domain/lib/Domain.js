
var CommandBus = require('./CommandBus');
var EventBus = require('./EventBus');
var Aggre = require('./Aggre');
var extend = require('node-extend');
var Repository = require('./Repository');
var EventStore = require('./EventStore');
var load = require('./utils/load');
var ioc = require('./utils/ioc');
var bindCommand = require('./utils/bindCommand');
var QueryBus = require('./QueryBus');
var bindQuery = require('./utils/bindQuery');
var regAggreType = require('./utils/regAggreType');
var bindEventHandle = require('./utils/bindEventHandle');
var DataStore = require('./DataStore');

var defaultOptions = { 

	aggresPath : '/aggres',
	commandsPath : '/commands',
	commandHandlesPath : '/commandHandles',
	eventHandlesPath : '/eventHandles',
	queriesPath:'/queries',
	queryHandlesPath:'/queryHandles',
	servicesPath:'/services'	

}

function Domain(options){

	var self = this;

	// external use.
	var proxy01 = {
		execute:function(cmd,callback){
			self.execute(cmd,callback);
		}
	}

	// command handle,event handle and aggre use.
	var proxy02 = {
		repo:function(typeName){
			return self.repo(typeName);
		}
	}

	// query handle use.
	var proxy03 = {
		// return query function. query type if function.
		query:function(typename){
			return DataStore.get(typename).query();
		}
	}

	if(!options.mainPath) 
		throw new Error('No set mainPath,please set it.');

	var options = options;
	for(var k in defaultOptions){
		if(options[k]);
		else{
			options[k] = defaultOptions[k];
		}
	}

	// bind database.
	options.dbs.forEach(function(db){
		new DataStore(db);
	})

	var Store = options.Store;
	var aggreTypes = {};
	var repos = {};
	var commands = {};
	var commandHandles = {};
	var eventHandles = {};
	var queries = {};
	var queryHandles = {};
	var services = {};

	var eventBus = new EventBus(proxy02);
	var commandBus =  new CommandBus(proxy02);
	var queryBus = new  QueryBus(proxy03);

	// listen aggre update event.
	// and to DB store.
	eventBus.on('update',function(e){
		var name = e.aggreType.name;
		var db  =  DataStore.get(name);

		if(db){
		   db.update(e.agreeId,e.data,function(err){
			if(err) console.log(err);
		   })
		}

	});

	// listen aggre create event.
	// add to DB...
	eventBus.on('create',function(e){
		var name = e.aggreType;
		var db  =  DataStore.get(name);
		if(db){

		db.save(e._data._data,function(err){
			if(err) console.log(err);
		})
		}
	});	

	// listen aggre remove event.
	eventBus.on('remove',function(e){
		var name = e.aggreType.name;
		var db  =  DataStore.get(name);
		if(db){
		db.remove(e.agreeId,function(err){
			if(err) console.log(err);
		})
		}
	});

	load(options.mainPath+options.aggresPath,aggreTypes);
	load(options.mainPath+options.commandsPath,commands);
	load(options.mainPath+options.commandHandlesPath,commandHandles);
	load(options.mainPath+options.eventHandlesPath,eventHandles);
	load(options.mainPath+options.servicesPath,services);

	for(var k in aggreTypes){
		regAggreType(repos,aggreTypes,aggreTypes[k],options.Store,eventBus);
	}

	ioc(aggreTypes,proxy02);
	bindCommand(commandBus,commands,commandHandles);
	bindEventHandle(eventHandles,eventBus);
	bindQuery(queryBus,queries,queryHandles)

	this.repo = function(typeName){
		return repos[typeName];
	}
 
	this.execute = function(cmd,callback){
		var CMD  =  commands[cmd.name];
		var handle = commandHandles[cmd.name];
		if(!handle){
			callback(new Error('no handle.'))
		}else if(!CMD){
			
		}else{
			try{
				var c = new CMD(cmd.data);
				commandBus.execute(cmd.name,cmd.data,callback);
			}catch(e){
				callback(e);
			}
		}
	}

	return proxy01;
}

module.exports = Domain;
