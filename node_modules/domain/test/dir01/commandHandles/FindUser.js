module.exports = function FindUser(cmd,callback){
	this.domain.repo('User').findById(cmd.id,callback);
}