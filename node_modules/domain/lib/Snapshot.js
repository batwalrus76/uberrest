
var uuid = require('node-uuid');

function Snapshot(aggreType,aggreId){

	this._data = {
		num:0,
		events:[],
		id:uuid.v4(),
		aggreState:{},
		version:"0.0.1",
		createTime:new Date().getTime(),
		aggreType:aggreType,
		aggreId:aggreId
	}

}

Snapshot.prototype = {

	get num(){
		return this._data.num;
	},
	get events(){
		return this._data.events;
	},
	get id(){
		return this._data.id;
	},
	get aggreState(){
		return this._data.aggreState;
	},
	get version(){
		return this._data.version;
	},
	get createTime(){
		return this._data.createTime;
	},
	get aggreType(){
		return this._data.aggreType;
	},
	get aggreId(){
		return this._data.aggreId;
	}
	
}

module.exports = Snapshot;