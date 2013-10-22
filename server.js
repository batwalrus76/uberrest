#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var mongo   = require('./mongo.js');
var cas     = require('./cas.js');
var ubertool= require('./ubertool.js');
var batch   = require('./batch.js');
var user    = require('./user.js');
var formula = require('./formula.js');
/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;
    var db = mongo.getDB();
    cas.setDB(db);
    ubertool.setDB(db);
    user.setDB(db);
    formula.setDB(db);
    batch.setDB(db);
    
    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };
        self.post_routes = { };

        self.routes['/cas/:cas_num'] = function(req, res) {
            console.log("/cas/" + req.params.cas_num + " REST API reached ");
            cas.getChemicalName(req.params.cas_num, function(error,chem_name){
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(chem_name);
            });
        };

        self.routes['/all-cas'] = function(req, res) {
            console.log("/all-cas REST API reached");
            cas.getAll(function(error,all_cas){
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(all_cas);
            });
        };

        self.routes['/casdata/:chemical_name'] = function(req, res) {
            var chemical_name = req.params.chemical_name;
            console.log("Chemical Name: " + chemical_name);
            cas.getChemicalData(chemical_name, function(error,cas_data){
                if(cas_data != null)
                {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    res.send(cas_data);
                }
            });
        };

        self.routes['/ubertool/:config_type/config_names'] = function(req, res) {
            var config_type = req.params.config_type;
            console.log("Config Type: " + config_type);
            ubertool.getAllConfigNames(config_type,function(error,config_names){
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(config_names);
            });
        };

        self.routes['/ubertool/:config_type/:config'] = function(req, res) {
            var config_type = req.params.config_type;
            var config = req.params.config;
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            console.log("Config Type: " + config_type);
            console.log("Config: " + config);
            ubertool.getConfigData(config_type,config,function(error,config_data){
                res.send(config_data);
            });
        };

        self.post_routes['/batch'] = function submitBatch(req, res, next){
            console.log("Batch Submitted to Node.js server.");
            var body = '';
            req.on('data', function (data)
            {
                body += data;
            });
            //console.log(body);
            req.on('end', function ()
            {
                var json = JSON.parse(body);
                //console.log(JSON.stringify(json)); 
                var results = rabbitmq.submitUbertoolBatchRequest(json);
            });
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.send("Submitting Batch.\n");
        };

        self.routes['/batch_configs'] = function(req, res, next) {
            batch.getBatchNames(function(error, batch_ids){
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(batch_ids);
            });
        };

        self.routes['/batch_results/:batchId'] = function(req, res, next) {
            var batchId = req.params.batchId;
            console.log("BatchId: " + batchId);
            batch.getBatchResults(batchId, function(error, batch_data){
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                if(batch_data != null)
                {
                    res.send(batch_data);
                } else {
                    res.send("Problem returning results");
                }
            });
        };

        self.post_routes['/batch_results/:batchId'] = function(req,res,next){
            var batchId = req.params.batchId;
            console.log("BatchId: " + batchId);
            var body = '';
            req.on('data', function (data)
            {
                body += data;
            });
            req.on('end', function ()
            {
                console.log("body: " + body);
                var json = JSON.parse(body);
                var user_id = json.user_id;
                var user_api_key = json.api_key;
                console.log("json user_id: " + user_id + " user_api_key: " + user_api_key);
                user.authenticateRestAccess(user_id,user_api_key,function(err,authenticated){
                    console.log("authenticated: " + authenticated);
                    if(authenticated){
                        batch.getBatchResults(batchId, function(error, batch_data){
                            res.header("Access-Control-Allow-Origin", "*");
                            res.header("Access-Control-Allow-Headers", "X-Requested-With");
                            if(batch_data != null)
                            {
                                res.send(batch_data);
                            } else {
                                res.send("Problem returning results");
                            }
                        });
                    } else {
                        console.log('User API Authentication failed');
                        res.send("User: " + user_id + " passed an incorrect api key and cannot call this method.");
                    }
                });
            });
        };

        self.post_routes['/ubertool/:config_type/:config'] = function(req,res){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
            var config_type = req.params.config_type;
            var config = req.params.config;
            var body = '';
            var json = '';
            req.on('data', function (data)
            {
                body += data;
            });
            req.on('end', function ()
            {
                json = JSON.parse(body);
                console.log("POST for Configuration Name: " + config + " config type: " + config_type + " json data: " + body);
                ubertool.addUpdateConfig(config_type,config,json, function(error, results)
                {
                    console.log("Returning: " + results);
                    res.send(results);
                });
            });
        };

        self.post_routes['/user/login/:userid'] = function(req, res, next){
            var user_id = req.params.userid;
            console.log('user id: ' + user_id);
            var body = '';
            req.on('data', function (data)
            {
                body += data;
            });
            req.on('end', function ()
            {
                json = JSON.parse(body);
                user.getLoginDecision(user_id,json.password,function(err, decision_data){
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    res.header('Access-Control-Allow-Methods', "POST");
                    if(decision_data.decision)
                    {
                        var acsid_string = "test="+decision_data.sid;
                        console.log("acsid_string: " + acsid_string);
                        res.header('Set-Cookie',acsid_string);
                    }
                    res.send(decision_data);
                });
            });
        };

        self.post_routes['/user/registration/:user_id'] = function(req, res, next){
            var user_id = req.params.user_id;
            console.log('user id: ' + user_id);
            var body = '';
            req.on('data', function (data)
            {
                body += data;
            });
            req.on('end', function ()
            {
                json = JSON.parse(body);
                console.log(json);
                console.log('password: ' + json.pswrd);
                console.log('email address: ' + json.email_address);
                user.registerUser(user_id,json.pswrd,json.email_address,function(err, sid_data){
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    res.header('Access-Control-Allow-Methods', "POST");
                    res.send(sid_data);
                });
            });
        };

        self.post_routes['/user/openid/login'] = function(req, res, next){
            var body = '';
            req.on('data', function (data)
            {
                body += data;
            });
            req.on('end', function ()
            {
                var json = JSON.parse(body);
                user.openIdLogin(json.openid, function(err, login_data){
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    res.header('Access-Control-Allow-Methods', "GET");
                    res.send(login_data);
                });
            });
        };

        self.post_routes['/user/sessionid'] = function(req, res, next){
            var body = '';
            req.on('data', function (data)
            {
                body += data;
            });
            req.on('end', function ()
            {
                var json = JSON.parse(body);
                var user_id = json['user_id'];
                var session_id = json['session_id'];
                console.log("User id: " + user_id + " session id: " + session_id);
                user.checkUserSessionId(user_id, session_id, function(err, decision_data){
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    res.header('Access-Control-Allow-Methods', "POST");
                    console.log(decision_data);
                    res.send(decision_data);
                });
            });
        };

        self.routes['/all-cas'] = function(req, res, next){
            cas.getAll(function(error,all_cas){
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(all_cas);
            });
        };

        //Formula Services
        self.routes['/formula/:registration_num'] = function(req, res, next){
            var registration_num = req.params.registration_num;
            console.log("Registration Number: " + registration_num);
            formula.getFormulaData(registration_num, function(error,chemicals){
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                console.log(chemicals)
                res.send(chemicals);
            });
        };

        self.routes['/formulas/:pc_code'] = function(req, res, next){
            var pc_code = req.params.pc_code;
            console.log("PC Code: " + pc_code);
            formula.getFormulaDataFromPCCode(pc_code, function(error,chemical){
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(chemical);
            });
        };

        self.routes['/all_formula'] = function(req, res, next){
            formula.getAllFormulaData(function(error,formula_data){
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.send(formula_data);
            });
        };

        self.routes['/api'] = function(req, res) {
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
            "GET: Retrieves an API Key, though this is not stored to a user, just a means of generating an API key. ";
            res.send(apiDescription);
        }

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }

        for (var r in self.post_routes) {
            self.app.post(r, self.post_routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
