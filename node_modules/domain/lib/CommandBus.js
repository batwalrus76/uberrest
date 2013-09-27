function CommandBus(domain){
	var repo = {};
	repo.domain = domain;
	this.bind = function(commandName,handle){
		repo[commandName] = handle;
	}

	this.execute = function(cmdName,command,callback){
		repo[cmdName](command,callback);
	}
}



module.exports = CommandBus;
