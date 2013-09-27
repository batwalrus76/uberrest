
function QueryBus(domain){

	var repo = {};
	repo.domain = domain;

	this.bind = function(queryName,handle){
		repo[queryName] = handle;
	}

	this.execute = function(queryName,query,callback){
		repo[queryName](query,callback);
	}
	
}

module.exports = QueryBus;
