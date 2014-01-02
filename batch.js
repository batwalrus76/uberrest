var batch = null;

exports.setDB = function(db)
{
    batch = db.collection('Batch');
}

exports.getBatchNames = function(callback)
{ 
    var completedBatchNames = {};
    batch.find({completed:{$exists:true}}).toArray(function(err,items) {
      console.log("Getting Batch Names");
      for(var i=0; i < items.length; i++)
      {
        var item = items[i];
        completedBatchNames[item.batchId]=item.completed.toString();
      }
      console.log(completedBatchNames);
      callback(null,completedBatchNames);
    });
}

exports.getBatchResults = function(batch_id,callback)
{ 
    batch.findOne({batchId:batch_id},function(err,batch) {
      console.log("getBatchResults");
      console.log(batch);
      callback(null,batch);
    });
}

exports.createNewBatch = function(batch_id, data,callback)
{
    batch.insert({batchId:batch_id,ubertool_data:{}});
    console.log("Data: " + data);
    batch.findOne({batchId:batch_id}, function(err, batch_instance) {
        if(batch_instance != null)
        {
            console.log("Batch instance is not null.");
            var createdTime = new Date();
            batch_instance.created = createdTime.toString();
            batch.save(batch_instance);
        } else {
            console.log("Batch instance is null.");
        }
        callback(null,batch_id,data);
    });
}

exports.addEmptyUbertoolRun = function(config_name,batch_id,ubertoolRunData,callback)
{
    batch.findOne({batchId:batch_id}, function(err, batch_instance) {
        console.log("addEmptyUbertoolRun  ");
        var ubertool_run = {};
        var createdTime = new Date();
        ubertool_run.created = createdTime.toString();
        ubertool_run.config_name = config_name;
        ubertool_run.config_properties = ubertoolRunData;
        var ubertool_data = batch.ubertool_data;
        console.log('Before - ubertool_data: ' + ubertool_data);
        if(ubertool_data == null)
        {
            ubertool_data = {};
        }
        ubertool_data[config_name] = ubertool_run;
        console.log('After - ubertool_data: ' + ubertool_data);
        batch_instance.ubertool_data = ubertool_data;
        batch_instance.created = createdTime.toString();
        batch.save(batch_instance);
        console.log(batch_instance);
        callback(ubertoolRunData);
    });
}

exports.updateUbertoolRun = function(config_name,batch_id,data,callback)
{
    batch.findOne({batchId:batch_id}, function(err, batch) {
        updateUbertoolBatch(batch,data,config_name,collection, function(err, batch_instance){
            callback(batch_instance);
        });
    });
}

function updateUbertoolBatch(batch_instances, data, config_name,collection,callback)
{
    console.log("Finding One batch for update.");
    console.log(batch);
      
    var isCompleted = false;
    if(ubertool_data in batch_instances)
    {
        var ubertool_data = batch_instances.ubertool_data;
        for(var ubertool_run in ubertool_data)
        {
            var tempIsCompleted = updateCompletedUbertoolRun(collection,batch_instances,ubertool_data[ubertool_run],config_name,data)
            if(!isCompleted && tempIsCompleted)
            {
                isCompleted = true;
            }
        }
        if(isCompleted)
        {
            var completedTime = new Date();
            batch_instances.completed = completedTime.toString();
        }
        batch.save(batch_instances);
        callback(batch_instances);
    }
}

function updateCompletedUbertoolRun(collection,batch_instances,ubertool_run,config_name,data )
{
    var isCompleted = true;
    var ubertool_run_config_name = ubertool_run.config_name;
    console.log("updateUbertoolRun: " + ubertool_run_config_name + " config_name: " + config_name);
    if(ubertool_run_config_name == config_name)
    {
        console.log("Completed ubertool run: " + ubertool_run_config_name);
        for(var datum in data)
        {
            ubertool_run[datum] = data[datum];
        }
        var completedTime = new Date();
        ubertool_run.completed = completedTime.toString();
        batch.save(batch_instances);
    } else {
        var ubertoolRunCompleted = ubertool_run.completed;
        if(ubertoolRunCompleted == null)
        {
            isCompleted = false;
        }
        console.log("Ubertool run: " + ubertool_run_config_name + " completion status: " + isCompleted);
    }
    return isCompleted;
}
