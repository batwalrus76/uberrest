var b = require('./bindEventHandle')
module.exports = function bindExtensions(){
	b.apply(this,arguments);
}