module.exports = Aggre;

var EventEmitter  =  require('events').EventEmitter;
var util = require('util');
var uuid = require('node-uuid');
var Event = require('./Event')

//cqrs system will bind 'domain' object to Aggre.prototype.domain;
//so aggre can use this.domain.
//and , this.domain only have a function , it is this.domain.repo.
function Aggre(data){
	if(!data) data = {}

	EventEmitter.call(this);
	var emit = new EventEmitter;

	// aggre self data.
	var __data = data;

	__data.id = uuid.v1();
	// aggre is live.
	__data.state = 'LIVE';

	var self = this;
	self.on('remove',function(){
		 __data.state = 'DEAD';							
	});
	

	// only read.
	// get aggre data , it is unique way.
	// example: aggre.data();
	// Note, the data only clone. 
	this.data = function(){
		if(arguments.length === 0){
			return __data;	
		}else	if(arguments.length === 1){
			return __data[arguments[0]]; 	
		}
	}

	// this.data is write.
	emit.data = function(){
		if(arguments.length === 0){
			return __data;	
		}else	if(arguments.length === 1){
			return __data[arguments[0]]; 	
		}else if(arguments.length === 2){
			__data[arguments[0]] = arguments[1];
		}
	}
	emit.updateState = self.$updateState;
	emit.updateState();

	// publish event , event is a array.
	// var event = [arg0,arg1];
	// arg0 is string type, mean is event name.
	// arg1 is json object type, mean is event data.
	this.publish = function(d){
   	var e = new Event(d[0],d[1]);      
	 e._data.aggreType = this.constructor.name;
	 e._data.aggreId = this.id;
	 emit.emit(e.name,e.data);
	 if(emit._events[e.name]){
			var e2 = ['update',self.data()];
			self.publish(e2);
	 }
	 this.emit(e.name,e.data);
	 this.domain.repo(this.constructor.name).publish(e,function(next){next()});
	}

	// it's temp , run out kill.	
	this._loadEvents = function(events){
		events.forEach(function(event){
			emit.emit(event.name,event.data);
		});
		delete this._loadEvents;
	}


}

util.inherits(Aggre,EventEmitter);

Aggre.prototype.remove = function(){
var e = ['remove'];
this.publish(e);
}

Aggre.prototype.__defineGetter__('id',function(){
	return this.data('id');
});
