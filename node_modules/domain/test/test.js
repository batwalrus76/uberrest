var assert = require('assert');
var should = require('should');
var Domain = require('..');
var EventStore = require('../../cqrsnode.eventstore').Tiny;
var DBStore = require('../../cqrsnode.dbstore').Mongoose; 

describe('Domain', function(){
var domain;
var obj = null;
var id = null;

  describe('#new', function(){
    it('create new domain', function(done){
        domain = new Domain({mainPath:__dirname+'/dir01',Store:EventStore,dbs:[]});
        done()
    })
  })

describe('#create',function(){

		it('create new User',function(done){
			setTimeout(function(){
				var cmd = {name:'CreateUser'};
				domain.execute(cmd,function(result){
					obj = result;
					result.should.be.a('object');
					done()
				});
			},1000)
		})

	})

	describe('#command',function(){
		 it('change user name',function(done){
		 	obj.changeName('brighthas');
		 	obj.data('name').should.equal('brighthas');
		 	id  =  obj.id;
		 	done()
		 })
	})


	describe('#findbyID',function(){
		 it('find user',function(done){

		 	var cmd = {name:'FindUser',data:{id:id}};
		 	domain.execute(cmd,function(result,next){
		 		next();
				done();

		 	})
		 	
		 })
	})

	
})


