

var restify = require('restify');

var server = restify.createServer();
server.use(restify.CORS());
server.use(restify.fullResponse());

server.get('/api', function(req, res, next){
    console.log("Describe REST API");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var apiDescription = "/user/login/:userid<br>"+
    "POST: Decides if the password passed in the json in the body of the request (key password) is valid for the user id as the last part of the url. Returns a json document with the decision(true/false), the sessionId, expiration date time. It adds a value to the passed cookie that tells google appengine that the user is valid to view protected pages.<br>"+
    "/user/registration/:user_id<br>"+
    "POST: registers a user given the user id as the last part of the url and the password and email address passed as arguments in the json request. Returns a json document with the sessionId, expiration date time.<br>"+
    "/user/openid/login<br>"+
    "POST: Using the openId passed in the json request, retrieves the userId, sessionId, and expiration date time for the sessionID. <br>"+
    "/user/sessionid<br>"+
    "POST: Attempts to validate a sessionId for a userId, both passed as arguments in the json request. Returns a json document with the decision(true/false), the sessionId, expiration date time.<br>"+
    "/batch_configs<br>"+
    "GET: Retrieves all the names for batch configurations in the system. No parameters are passed<br>"+
    "/batch<br>"+
    "POST: Submits a batch configuration to the asynchronous batching system via RabbitMQ.<br>"+
    "/batch_results/:batchId <br>"+
    "GET: Retrieves the results of an ubertool batch, based on the batchId passed in the URL. Returns a hierarchical JSON data.<br>"+
    "POST: Similar to GET request, except that it authenticates the userId along with an apiKey (both passed as arguments in the json documents).  If authenticated to a valid user, will retrieve results.<br>"+
    "/cas/:cas_num<br>"+
    "GET: Retrieves the chemical name associated with a CAS number<br>"+
    "/casdata/:chemical_name<br>"+
    "GET: Retrieves the CAS Number and PC Code<br>"+
    "/all-cas<br>"+
    "GET: Retrieves all of the CAS Numbers<br>"+
    "/formula/:registration_num<br>"+
    "GET: Retrieves formulation data based on a registration number. This service returns PC Percentage, Product Name, and PC Code in the json response.<br>"+
    "/formulas/:pc_code<br>"+
    "GET: Retrieves all of the formulations given a PC Code. The return is a json document containing an array of data, each data record contains Registration Number, PC Percentage, Product Name, and PC Code"+
    "/all_formula"+
    "GET: Retrieves all of the formulations available.  The return is a json document containing an array of data, each data record contains Registration Number, PC Percentage, Product Name, and PC Code"+
    "/ubertool/:config_type/config_names"+
    "GET: Retrieves all configurations for a given ubertool configuration (use, pest, aqua, eco, expo, terre, ubertool). Returns a json document, with a variety of properties."+
    "/ubertool/:config_type/:config"+
    "GET:  Retrieves a configuration for a given ubertool configuration (use, pest, aqua, eco, expo, terre, ubertool) based on a specific configuration ID (the last part of the url). Returns a json document, with a variety of properties."+
    "POST: Places an ubertool configuration into the mongo db, which can be referenced by ubertool configurations and is the basis for running an ubertool batch."+
    "/api-key"+
    "GET: Retrieves an API Key, though this is not stored to a user, just a means of generating an API key."+
    res.send(apiDescription);
});

server.on('MethodNotAllowed', unknownMethodHandler);

function unknownMethodHandler(req, res) {
  if (req.method.toLowerCase() === 'options') {
    var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version'];

    if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
    res.header('Access-Control-Allow-Methods', res.methods.join(', '));
    res.header('Access-Control-Allow-Origin', req.headers.origin);

    return res.send(204);
  }
  else
    return res.send(new restify.MethodNotAllowedError());
}

server.listen(8887, function() {
  console.log('%s listening at %s', server.name, server.url);
});