var _ = require('underscore')
var es = require('event-stream')
var fs = require('fs')
var events = require('events')
var fibrous = require('fibrous')
var config = require('../config.js')
var db = require('../common/db.js')
	// var mysql = require('./common/mysql.js')
var distance = require('../common/distance.js')

var emitter = new events.EventEmitter()
var timestamp = Date.now()

function log_and_time(str) {
	var now = Date.now()
	console.log(str, '[time used', now - timestamp, 'ms]')
	timestamp = now
}

function start() {
	console.log('init')
	db.init('city')
	setTimeout(function() {
		// db.city.drop(function(err){
		// 	if(err) console.log(err)
		db.city.ensureIndex({
			"geo": "2d"
		}, db.default_db_callback)
		log_and_time('finished init')
		emitter.emit('index_provinces')
			// emitter.emit('statistic')
			// })
	}, 100)
}
start()

emitter.once('index_provinces', function() {
	var provinces = {}
	console.log('index city names')
	fs.createReadStream(config.raw.province, {
		flags: 'r'
	}).pipe(es.split()).pipe(es.through(function(line) {
		var row = line.split('\t')
		var city = {
			code: row[0].split('.'),
			name: row[1]
		}
		provinces[city.code[0]] = provinces[city.code[0]] || {}
		provinces[city.code[0]][city.code[1]] = city.name
	})).pipe(es.wait(function(err, text) {
		log_and_time('finished indexing city names')
		emitter.emit('index_city_locations', provinces)
			//db.mongodb.close()
	}))
})

emitter.once('index_city_locations', function(provinces) {
	console.log('index city locations')
	var cities = []
	var line_number = 0
		//this method is non-block
	function commit(cities, callback) {
		console.log('commiting', cities.length, 'docs')
		db.city.insert(cities, callback || db.default_db_callback)
	}
	fs.createReadStream(config.raw.city, {
		flags: 'r'
	}).pipe(es.split()).pipe(es.through(function(line) {
		var row = line.split('\t')
		line_number++
		var city = {}
		city.name = row[1]
		city.asciiname = row[2]
		city.alias = row[3]
		city.geo = {
			lat: Number(row[4]),
			lng: Number(row[5])
		}
		city.country_code = row[8]
		city.province_code = row[10]
		city.province_name = provinces[city.country_code] ? provinces[city.country_code][city.province_code] : undefined
		if (city.province_name)
			cities.push(city)
		else {
			console.log('warn province name not found', city.country_code, city.province_code, city.name, 'in line', line_number)
				//console.log(row)
		}
		if (cities.length >= 20000) {
			commit(cities)
			cities = []
		}
	})).pipe(es.wait(function(err, text) {
		if (cities.length) {
			commit(cities, function(err) {
				if (err) console.log(err)
				emitter.emit('statistic')
			})
		} else {
			emitter.emit('statistic')
		}
		log_and_time('finished indexing city locations.')
	}))
})

/*emitter.once('statistic',function(){fibrous.run(function(){
	console.log('doing statistic')
	// var rs = mysql.connection.sync.query(config.mysql.sql)
	// console.log('locations size',rs.length)
	// var last_city
	// for(var i in rs){
	// 	var loc = rs[i]
	// 	loc.latitude = loc.latitude/3600000
	// 	loc.longitude = loc.longitude/3600000
	// 	var near_city
	// 	if(last_city){
	// 		var dis = distance(loc.latitude,loc.longitude,last_city.geo.lat,last_city.geo.lng)
	// 		if(dis>2){
	// 			//console.log('distance from',last_city.province_name,'[',last_city.name,']','is',dis)
	// 			near_city = null
	// 		}
	// 	}
	// 	if(!near_city){
	// 		near_city = db.city.sync.findOne({geo:{$near:[loc.latitude,loc.longitude]}},{_id:0,geo:1,province_name:1,name:1})
	// 		console.log(loc.latitude,loc.longitude,near_city.province_name,'[',near_city.name,']')
	// 	}
	// 	last_city = near_city
	// }
	db.mongodb.close()
	// mysql.connection.end()
})})*/