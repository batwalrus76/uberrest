#!/usr/bin/env node

var fs = require('fs');

var projectName = "";
if(procces.args.length > 0){
	projectName = process.args[0]+'/';
	fs.mkdirSync(projectName);
}

fs.mkdir(projectName+'aggres', function(){});
fs.mkdir(projectName+'commands', function(){});
fs.mkdir(projectName+'commandHandles', function(){});
fs.mkdir(projectName+'dbs', function(){});
fs.mkdir(projectName+'eventHandles', function(){});
fs.mkdir(projectName+'extensions', function(){});
fs.mkdir(projectName+'queries', function(){});
fs.mkdir(projectName+'queryHandles', function(){});
