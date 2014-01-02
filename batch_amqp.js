var batch  = require('./batch.js');
var Stomp = require('stompjs');

var client = Stomp.overWS('ws://localhost:61614/stomp');
var batchSubmissionQueue = "/queue/UbertoolBatchSubmissionQueue";
var batchResultsQueue = "/queue/UbertoolBatchResultsQueue";

var connect_callback = function() {
    // called back after the client is connected and authenticated to the STOMP server
    console.log("Connected!")
    var subscription = client.subscribe(batchResultsQueue, function(message) {
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
};

var error_callback = function(error) {
    // display the error's message header:
    alert(error.headers.message);
};

client.connect("admin", "admin", connect_callback, error_callback, "localhost");

exports.submitUbertoolBatchRequest = function (msg)
{
    var ubertools = msg['ubertools'];
    var batchId = msg['id'];
    console.log("SubmitUbertoolBatchRequest");
    batch.createNewBatch(batchId,ubertools, function(error,batchId,ubertools){
        if(error == null)
        {
            submitNextUbertoolRun(ubertools,batchId,0,submitNextUbertoolRun); 
        }
    });
}

function submitNextUbertoolRun(ubertools,batchId,index,callback){
    if(ubertools != undefined && index < ubertools.length)
    {
        console.log("Ubertools index: " + index);
        var ubertoolRunData = ubertools[index];
        ubertoolRunData['batchId'] = batchId;
        var config_name = ubertoolRunData['config_name'];
        batch.addEmptyUbertoolRun(config_name,batchId,ubertoolRunData,function(ubertoolRunData){ 
            client.send(batchSubmissionQueue,{message:JSON.stringify(ubertoolRunData)});
            if(index + 1 < ubertools.length)
            {
                index++;
                callback(ubertools,batchId,index,callback);
            }
        });
    }
}
