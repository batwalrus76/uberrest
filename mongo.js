var ip_addr = process.env.OPENSHIFT_NODEJS_IP   || '127.9.164.2';
var port    = process.env.OPENSHIFT_NODEJS_PORT || '8080';
var database = "ubertool";
// default to a 'localhost' configuration:
var connection_string = ""; //mongodb://admin:TanQaEQVmPrP@127.9.164.2:27017/ubertool";//ip_addr+':27017/ubertool';
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
var db = mongojs(connection_string, ['CAS']);
var cas = db.collection('CAS');

exports.getAll = function(callback)
{
	console.log("Retrieving all cas data");
	// similar syntax as the Mongo command-line interface
	// log each of the first ten docs in the collection
	cas_nums_chem_names = [];
	cas.find().forEach(function(err, doc) {
		//
		if(doc != null)
		{
		  cas_data = {"ChemicalName":doc.ChemicalName,"CASNumber":doc.CASNumber,"PCCode":doc.PCCode};
			//console.log(cas_data);
	  		cas_nums_chem_names.push(cas_data);
	  		//console.log(cas_nums_chem_names);

      console.log(cas_data);
    	}
	});
	console.log(cas_nums_chem_names);
	callback(null,cas_nums_chem_names);
}

exports.getChemicalName = function(cas_number,callback)
{
    console.log("Retrieving chemical name data for " + cas_number);
    cas.findOne({CASNumber:cas_number},function(err,CAS) {
        console.log(CAS);
        if(CAS != null)
        {
        	callback(null,CAS.ChemicalName.substring(0,20));
      	} else {
      		callback(null,"");
      	}
    });
}

exports.getChemicalData = function(chemical_name, callback)
{
	console.log("Retrieving all chemica data for " + chemical_name);
    cas.findOne({ChemicalName:chemical_name},function(err,CAS) {
	    var cas_data = null;
	    if(CAS != null)
	    {
	    	cas_data = {"ChemicalName":CAS.ChemicalName,"CASNumber":CAS.CASNumber,"PCCode":CAS.PCCode};
	    }
      console.log(CAS);
      console.log(cas_data);
	    callback(null,cas_data);
    });
}

exports.getAllChemicalNames = function(callback)
{
	console.log("Retrieving all chemical names available.");
  	getAll( function(err,cas_data){
    	var utf8_cas_data = [];
    	for(i = 0; i < cas_data.length; i++)
    	{
      		utf8_cas_data.push(cas_data[i].ChemicalName);
    	}
    	callback(null,utf8_cas_data);
  	});
}