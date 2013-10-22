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
  console.log("added ubertool-related collections");
}

exports.getAllConfigNames = function(config_type,callback)
{
  var config_collection = null;
  if(config_type == 'aqua')
  {
    config_collection = aqua;

  } else if(config_type == 'eco')
  {
    config_collection = eco;
  } else if(config_type == 'expo')
  {
    config_collection = expo;
  } else if(config_type == 'pest')
  {
    config_collection = pest;
  } else if(config_type == 'terre')
  {
    config_collection = terre;
  } else if(config_type == 'use')
  {
    config_collection = use;
  } else if(config_type == 'ubertool')
  {
    config_collection = ubertool;
  } 
  if(config_collection != null)
  {
    config_collection.find().toArray(function(err,all_data) {
      var config_names = [];
      for(i = 0; i < all_data.length; i++)
      {
        config_names.push(all_data[i].config_name);
      }
      callback(null,config_names);     
    });
  }
}

exports.getConfigData = function(config_type,config,callback)
{ 
  var config_collection = null;
  if(config_type == 'aqua')
  {
    config_collection = aqua;
  } else if(config_type == 'eco')
  {
    config_collection = eco;
  } else if(config_type == 'expo')
  {
    config_collection = expo;
  } else if(config_type == 'pest')
  {
    config_collection = pest;
  } else if(config_type == 'terre')
  {
    config_collection = terre;
  } else if(config_type == 'use')
  {
    config_collection = use;
  } else if(config_type == 'ubertool')
  {
    config_collection = ubertool;
  } 
  if(config_collection != null)
  {
    config_collection.findOne({'config_name':config},function(err,config_data) {
      console.log(config_data);
      callback(null,config_data);
    });
  }
}

exports.addUpdateConfig = function(config_type,config,json_data,callback)
{
  var config_collection = null;
  if(config_type == 'aqua')
  {
    config_collection = aqua;
  } else if(config_type == 'eco')
  {
    config_collection = eco;
  } else if(config_type == 'expo')
  {
    config_collection = expo;
  } else if(config_type == 'pest')
  {
    config_collection = pest;
  } else if(config_type == 'terre')
  {
    config_collection = terre;
  } else if(config_type == 'use')
  {
    config_collection = use;
  } else if(config_type == 'ubertool')
  {
    config_collection = ubertool;
  }
  if(config_collection != null)
  {
    console.log(json_data);
    config_collection.update({'config_name':config}, json_data, {upsert:true, w:1},function(err,doc){
        console.log("added document");
        console.log(doc);
        callback(null,doc);
    });
  }
}
