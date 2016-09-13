////////db start////////
var db = {}
module.exports = db

db.default_db_callback = function(err, others){
	if(err) console.log(err)
}
db.init = function(){
	var collections = Array.prototype.slice.call(arguments, 0)
	console.log('init db:',JSON.stringify(collections))
	for(var i in collections){
		var name = collections[i]
		if(db[name]) continue
		db[name] = db.mongodb.collection(name)
	}
}
db.ensureIndex = function(collection,field,option){
	var index
	if(typeof(field)=='string'){
		index = {}
		index[field] = 1
	}else{
		index = field
	}
	if(option)
		db[collection].ensureIndex(index, option, db.default_db_callback)
	else
		db[collection].ensureIndex(index, db.default_db_callback)
}
function init_db(){
	var config = require('../config.js')

	if(db.mongodb)
		db.mongodb.close()
	if(config.db.type=='tingodb'){
		var tingodb = require('tingodb')().Db
		db.mongodb = new tingodb(config.db.path,{w:1})
		db.toObjectID = function(id){return id}
	}else if(config.db.type=='mongodb'){
		var mongo = require('mongoskin')
		db.mongodb = mongo.db(config.db.path,{w:1})
		db.toObjectID = mongo.helper.toObjectID
	}else
		return
}
db.reset = function(){
	init_db()
	for(var name in db){
		if(typeof(db[name])!='object'||name=='mongodb') continue
		db[name] = db.mongodb.collection(name)
	}
}

init_db()
