module.exports = User;

function User(){
}

User.prototype = {
	$updateState:function(){
		this.on('changeName',function(name){
			this.data('name',name);
		})
	},
	changeName:function(name){
		var e = ['changeName',name];
		this.publish(e);
	}
}
