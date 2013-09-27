var step = require('step');
var Snapshot = require('./Snapshot');
var Event = require('./Event')


// it's functions no lock supper. so ->
// if you need lock method , you must yourself doing.
// reference ->  https://github.com/brighthas/lockMethod
function EventStore(aggreName,driver){

	this._create_snapshot_freq = 12;
	this._aggreName = aggreName;
	this._driver = driver;
	
}



EventStore.prototype = {

	// whenever saved 12 events, it will create a new snapshot.
	set create_snapshot_freq(freq){
		this._create_snapshot_freq = freq;		
	},

	// Arguments if (aggreId,callback) , then return latest .
	// if (aggreId,num,callback) , then return snapshot for num.
	// callback:(err,snapshot) , is no have , then snapshot is null.
	// so can : 
	// 
	// eventStore.getSnapshot(aggreId,function(err, snapshot){...});
    // this function get snapshot for latest.
	//
	// or
	//
	// eventStore.getSnapshot(aggreId,2,function(err, snapshot){...});
	// this function get snapshot for num is 2 . 
	getSnapshot : function(aggreId,num,callback){
		var args = arguments;
		if(arguments.length == 2){
			callback  =  num;
		}

		var driver = this._driver;
		var self = this;
		var snapshot = null;
		step(
			function(){
				if(args.length == 2){
					driver.getSnapshot(aggreId,this);
				}
				else{
					driver.getSnapshot(aggreId,num,this)
				}
				

			},
			function(err,ss){
			  if(err) throw err;
			  else if(!ss){
			    return null;
			  }else{
			    snapshot = new Snapshot();
			    snapshot._data = ss;
			    snapshot._data.events = [];
			    return snapshot;
			  }
			},
			function(err,ss){	

				if(!ss){
					return null;
				}else{
					driver.findEvents(aggreId,ss.num,this);
				}				
			},
			function(err,events){

				if(err) throw err;
				if(!events){					
				}else{
					for(var i=0 ; events.length > i; i++){
					var e = new Event;
					e._data = events[i];
					snapshot._data.events.push(e);

				    }				    
				}

				callback(null,snapshot);
			}
		);
	},

	// snapshot : Snapshot.class
	// callback(err)
	createSnapshot : function(aggreId,snapshot,callback){

		var self = this;
		var events = snapshot.events;
		snapshot._data.events = [];

		step(
			function(){
				self._driver.getSnapshot(aggreId,this);

			},
			function(err,ss){
				if(err){
					throw err;
				}else if(!ss){				
					self._driver.storeSnapshot(snapshot._data,this);
				}else{
					var num = ss.num+1;
					snapshot._data.num = num;
					self._driver.storeSnapshot(snapshot._data,this);
				}
			},
			function(err,ss){
				for(var i=0 ; events.length > i;i++){
					var e = events[i]._data;
					e.snum = snapshot.num;
					e.num = i;
					self._driver.storeEvent(e,this.parallel());
				}

			},

			function(err){

				callback(err);
			}
		);
		
	},

	// var event : Event.class
	// add event to latest snapshot.
	// callback(err)
	storeEvent : function(aggreId,aggreState,event,callback){
		var self = this;
		this.getSnapshot(aggreId,function(err,snapshot){
			
			if(err){

				callback(err,null);
			}else{
				
				if(!snapshot || snapshot.events.length >= self._create_snapshot_freq){

					var ss = new Snapshot(self._aggreName,aggreId);
					event._data.aggreId = aggreId;
					ss._data.aggreState = aggreState._data;
					ss._data.events.push(event);
					self.createSnapshot(aggreId,ss,callback);

				}else{

					var _event = event._data;
					_event.num = snapshot.events.length;
					_event.snum = snapshot.num;
					_event.aggreType = self._aggreName;
					_event.aggreId = aggreId;
					self._driver.storeEvent(_event,callback);
					

				}
			}
		});

	}

}

module.exports = EventStore;