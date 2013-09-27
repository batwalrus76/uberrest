Note
========
Integration, wait a few days, the full version will be released in the 0.2.0 version, so now does not work properly.

Tutorial
========
[Tutorials](https://github.com/brighthas/cqrsnode/wiki)

cqrsnode
=========
    CQRS framework for node.js


install
=========
    npm install cqrsnode

example
=========
    >cqrs
    result is create dirs:
        aggres | eventHandles | commands | commandHandles | dbs

    
Aggre API and Example:
=======================

		// create like it at /aggres dir.

		module.exports = User;

		function User(){}

		// create User obj function
		User.create = function(name){
			// ... u
			return u;
		}

		User.prototype = {

			// this function change aggre state,
			// state is aggre._data private state.
			// when aggre emit a event, you can use this function to listen.
			$updateState:function(){
				// example, listen 'changeName' event.
				this.on('changeName',function(name){
					// this.data is aggre._data.
					this.data.name = name;
				})
			},

			// you can create self function,
			// and each function will emit event,
			// so you use "this.publish" emit event.
			// please don't use this function change self._data, 
			// aggre function only create event and publish.
			// change self state , please write in $updateSate function.
			changeName:function(name){
				var e = ['changeName',name];
				this.publish(e);
			},

			// ... you can create other functions,
			// top only a example of function.
		}


