var uuid = require('node-uuid');

var snapshotsDB = {}
var eventsDB = {

}

function Store(aggreName){
	this.aggreName  =   aggreName;
	this.snapshotsDB = snapshotsDB;
	this.eventsDB = eventsDB;
	snapshotsDB[aggreName] = {};
	eventsDB[aggreName] = {};
}

Store.prototype = {
	getSnapshot:function(aggreId,num,callback){
		
		if(arguments.length == 2){
			callback = num;
			num = -1;
		}

		var _s = null;

		for(var k in snapshotsDB[this.aggreName]){

			var s = snapshotsDB[this.aggreName][k];
			if(s.aggreId === aggreId){
			  if(num >= 0 && s.num === num){
				_s = s;
				break;
			  }else if(num < 0){
			  	if(!_s){_s = s;}
			  	else if(_s.num < s.num){
			  		_s = s;
			  	}
			  }
			}
		}
		callback(null,_s);
	},
	findEvents:function(aggreId,snum,callback){

		var es = [];
		var es2 = [];
		for(var k in eventsDB[this.aggreName]){

		   var e = eventsDB[this.aggreName][k];
           if(aggreId === e.aggreId && snum === e.snum){
           	  es.push(e);
           }
		}

		function order(){
			if(es.length === 1){
				es2.push(es[0]);
			}else{
			for(var i = 0 ; i<es.length ; i++){

				var p = true;
				for(var ii = 0;ii<es.length;ii++){
					if(es[i].num <= es[ii].num){
					}else{
						p = false;
					}
				}
				if(p){
					es2.push(es[i]);
					es.splice(i,1);
					order();
				}
			}
			}
		}
		order()
		callback(null,es2);
	},
	storeSnapshot:function(snapshot,callback){
		snapshotsDB[this.aggreName][uuid.v1()] = snapshot;
		callback(null,snapshot);
	},
	storeEvent:function(e,callback){

		eventsDB[this.aggreName][uuid.v1()] = e;
		callback(null);
	}
}

module.exports = Store;