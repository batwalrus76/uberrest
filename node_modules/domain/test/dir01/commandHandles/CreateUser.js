module.exports = CreateUser;

function CreateUser(cmd,callback){
	this.domain.repo('User').create(callback);
}