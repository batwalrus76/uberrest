module.exports = DataStore;

var repo = {}

function DataStore(driver){
	this._driver =  driver;
	this._name = driver.name;
	repo[this._name] = this;
}



DataStore.get = function(name){
	return repo[name];
}

DataStore.prototype = {
	/*
		callback(err);
	*/
	remove:function(id,callback){
		this._driver.remove(id,callback);
	},

	/* 
		callback(err)
	*/
	update:function(id,data,callback){
		this._driver.update(id,data,callback);
	},

	/*
		callback(err,id)
	*/
	save:function(data,callback){
		this._driver.save(data,callback);
	},

	/* 
		
	 */
	query:function(){
		return this._driver.query();
	}

}
