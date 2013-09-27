var lock = require('lockmethod');
var Position = lock.Position;
var uuid = require('node-uuid');
var Event = require('./Event')

function Repository(aggreType,eventStore,eventBus){
	
 var self = this;
 this._es = eventStore;
 this._aggreType = aggreType;
 this._repo = {}
 this._repoT = {}
 this._bus = eventBus;
 
function loopremove(){
	var t = new Date().getTime();
	for(var k in self._repoT){
		if(t-self._repoT[k] > 10000 && self._repoT[k] != -1){
			delete self._repo[k];
		}
	}
	setTimeout(loopremove,1000*60*15);
 }
 loopremove();

}

var repo = Repository.prototype;

repo.findById = lock(new Position(0),function(id,cb){

	var self = this;
	var callback = cb;

	if(this._repo[id]){
	  if(self._repoT[id] !== -1)
	  self._repoT[id]	 =  new Date().getTime();
	  cb(this._repo[id]);	
	}else{
	   self._es.getSnapshot(id,function(err,ss){
	   	  if(err) throw err;
	   	  if(!ss) callback(null);
	   	  else{
	   	  	var events = ss.events;
	   	  	var aggreState  =  ss.aggreState;
	   	  	var a = new self._aggreType(aggreState);
	   	  	a._loadEvents(events);
	   	  	self._repo[id] = a;
	   	  	self._repoT[id]	 =  new Date().getTime();
	   	  	callback(self._repo[id]);
	   	  }
	   });
	}
});

repo.cache = function(id){
	this._repoT[id] = -1;
}

repo.nocache = function(id){
	this._repoT[id] = new Date().getTime();
}

// args is Array.
repo.create = function(args,callback){
	var self = this;
	if(arguments.length === 1){
		callback = args;
		var aggre = new this._aggreType(); 
	}else{
		var aggre = new this._aggreType(args);
	}

	this._repoT[aggre.data('id')]	 =  new Date().getTime();
	this._repo[aggre.data('id')] = aggre;

	var e = new Event('create',aggre);
	e._data.aggreId = aggre.data('id');
	e._data.aggreType = this._aggreType.name;
	
	this.publish(e,function(next){
		next();
	})

	callback(aggre);
}

repo.publish = lock(new Position(0,['_data','aggreId']),function(e,cb){
	
	var self = this;
	this._es.storeEvent(e.aggreId,self._repo[e.aggreId],e,function(){
		cb();
		self._bus.publish(e);	
	});	
});

module.exports = Repository;
