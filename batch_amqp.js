var batch  = require('./batch.js')
var stomp = require('stompjs');

//var client = new stomp.Stomp(stomp_args);
var client = stomp.overTCP('localhost', 61613);
client.debug = console.log;
client.connect('admin', 'admin', function(frame) {
    console.log('connected to Stomp');
    client.send('/queue/UbertoolBatchSubmissionQueue', {}, '{"config_name":"test","batchId":"12345"}');
    client.subscribe('/queue/UbertoolBatchResultsQueue', function(message) {
        console.log("received message body: " + message.body);
        var body = JSON.parse(message.body);
        var config_name = body.config_name;
        delete body.config_name;
        var batch_id = body.batchId;
        delete body.batchId;
        console.log(config_name);
        batch.updateUbertoolRun(config_name,batch_id,body, function(error, batch_data){
          console.log(batch_data);
        });
    });

});

exports.submitUbertoolBatchRequest = function (msg)
{
    var ubertools = msg['ubertools'];
    var batchId = msg['id'];
    console.log("SubmitUbertoolBatchRequest");
    console.log(msg);
    batch.createNewBatch(batchId,ubertools, function(error,batchId,ubertools){
        if(error == null)
        {
            submitNextUbertoolRun(ubertools,batchId,0,submitNextUbertoolRun); 
        }
    });
}

function submitNextUbertoolRun(ubertools,batchId,index,callback){
    if(index < ubertools.length)
    {
        console.log("Ubertools index: " + index);
        var ubertoolRunData = ubertools[index];
        ubertoolRunData['batchId'] = batchId;
        var config_name = ubertoolRunData['config_name'];
        batch.addEmptyUbertoolRun(config_name,batchId,ubertoolRunData,function(ubertoolRunData){ 
            submission_queue.publish('UbertoolBatchSubmissionQueue',{message:JSON.stringify(ubertoolRunData)});
            if(index + 1 < ubertools.length)
            {
                index++;
                callback(ubertools,batchId,index,callback);
            }
        });
    }
}