var ip_addr = process.env.OPENSHIFT_NODEJS_IP   || '127.9.164.2';
var port    = process.env.OPENSHIFT_NODEJS_PORT || '27018';
var database = "ubertool";
// default to a 'localhost' configuration:
// var connection_string = "mongodb://127.0.01:27017/uberrest";
var connection_string = "mongodb://admin:TanQaEQVmPrP@127.0.01:27017/uberrest";
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = "mongodb://" + process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}
console.log(connection_string);

var mongojs = require('mongojs');
console.log(connection_string);
db = mongojs(connection_string, ['CAS']);

exports.getDB = function()
{
	return db;
}