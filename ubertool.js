var aqua = null
var eco = null;
var expo = null;
var pest = null;
var terre = null;
var use = null;
var ubertool = null;

exports.setDB = function(db)
{
  aqua = db.collection('AquaticToxicity');
  eco = db.collection('EcosystemInputs');
  expo = db.collection('ExposureConcentrations');
  pest = db.collection('PesticideProperties');
  terre = db.collection('TerrestrialToxicity');
  use = db.collection('Use');
  ubertool = db.collection('Ubertool');
}

exports.getAllConfigNames = function(config_type,callback)
{
  var config_collection = '';
  if(config_type == 'aqua')
  {
    aqua.find().toArray(function(err,all_data) {
      var config_names = [];
      for(i = 0; i < all_data.length; i++)
      {
        config_names.push(all_data[i].config_name);
      }
      callback(null,config_names);     
    });
  } else if(config_type == 'eco')
  {
    config_collection = 'EcosystemInputs';
  } else if(config_type == 'expo')
  {
    config_collection = 'ExposureConcentrations';
  } else if(config_type == 'pest')
  {
    config_collection = 'PesticideProperties';
  } else if(config_type == 'terre')
  {
    config_collection = 'TerrestrialToxicity';
  } else if(config_type == 'use')
  {
    config_collection = 'Use';
  } else if(config_type == 'ubertool')
  {
    config_collection = 'Ubertool';
  } 
  /**
  db.collection(config_collection, function(err,collection){
    collection.find().toArray(function(err,all_data) {

    });
  });
**/
}
/**
exports.getConfigData = function(config_type,config,callback)
{ 
  var config_collection = '';
  if(config_type == 'aqua')
  {
    config_collection = 'AquaticToxicity';
  } else if(config_type == 'eco')
  {
    config_collection = 'EcosystemInputs';
  } else if(config_type == 'expo')
  {
    config_collection = 'ExposureConcentrations';
  } else if(config_type == 'pest')
  {
    config_collection = 'PesticideProperties';
  } else if(config_type == 'terre')
  {
    config_collection = 'TerrestrialToxicity';
  } else if(config_type == 'use')
  {
    config_collection = 'Use';
  } else if(config_type == 'ubertool')
  {
    config_collection = 'Ubertool';
  } 
  db.collection(config_collection, function(err,collection){
    collection.findOne({'config_name':config},function(err,config_data) {
      callback(null,config_data);
    });
  });
}

exports.addUpdateConfig = function(config_type,config,json_data,callback)
{
  var config_collection = '';
  if(config_type == 'aqua')
  {
    config_collection = 'AquaticToxicity';
  } else if(config_type == 'eco')
  {
    config_collection = 'EcosystemInputs';
  } else if(config_type == 'expo')
  {
    config_collection = 'ExposureConcentrations';
  } else if(config_type == 'pest')
  {
    config_collection = 'PesticideProperties';
  } else if(config_type == 'terre')
  {
    config_collection = 'TerrestrialToxicity';
  } else if(config_type == 'use')
  {
    config_collection = 'Use';
  } else if(config_type == 'ubertool')
  {
    config_collection = 'Ubertool';
  }
  console.log(config_collection);
  console.log(config);
  //console.log(json_data);
  db.collection(config_collection, function(err,collection){
    collection.findAndModify({config_name:config}, {created: 1},
      json_data, {new:true, upsert:true, w:1},function(err,doc){
        console.log("added document");
        console.log(doc);
        callback(null,doc);
      });
  });
}
**/