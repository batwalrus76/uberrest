var EventEmitter = require('events').EventEmitter;

function EventBus(domain){
	this.emitter = new EventEmitter;
	this.domain = domain;
}

EventBus.prototype = { 

publish:function publish(event){
	this.emitter.emit('newEvent',event);
	if(!event.aggreType){
		this.emitter.emit(event.name,event,cqrs);	
	}else{
		this.emitter.emit(event.aggreType+event.aggreId+event.name,event,this.domain);	
		this.emitter.emit(event.aggreType+event.name,event,this.domain);
		this.emitter.emit(event.aggreType,event,this.domain);
		this.emitter.emit(event.name,event,this.domain);
	}
},

on:function on(aggreType,aggreId,eventName,handle){
	if(arguments.length == 4){
		aggreType = aggreType + aggreId + eventName ;
	}else if(arguments.length == 3){
		aggreType = aggreType + aggreId;
		handle = eventName;
	}else{
		handle = aggreId;
	}
	this.emitter.on(aggreType,handle);
},

once:function once(aggreType,aggreId,eventName,handle){
	if(arguments.length == 4){
		aggreType = aggreType + aggreId + eventName ;
	}else if(arguments.length == 3){
		aggreType = aggreType + aggreId;
		handle = eventName;
	}else{
		handle = aggreId;
	}
	this.emitter.once(aggreType,handle);
}

}

module.exports  =  EventBus;