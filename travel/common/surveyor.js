var _ = require('underscore')
var es = require('event-stream')
var fs = require('fs')
var events = require('events')
var fibrous = require('fibrous')
var distance = require('./distance.js')

var emitter = new events.EventEmitter()

function get_city_info(city){
	if(!city) return {city:'',province:''}
	return {city:city.name,province:city.province_name}
}

function calc(map,province,loc){
	if(map.last_province==province){
		var start_loc = map[province].start_loc
		var adistance = distance(loc.lat,loc.lng,start_loc.lat,start_loc.lng)
		map[province].mileage += adistance
		map[province].start_loc = loc
	}else{
		//console.log('province change to',province)
		if(!map[province]){
			map[province] = {mileage:0}
		}
		if(map[province]){
			map[province].start_loc = loc
		}
		if(map.last_province){
			calc(map,map.last_province,loc)
		}
		map.last_province = province
	}
}

function statistic(db,locations,fuzzy,callback){fibrous.run(function(){
	var loc_map = {}//{province:{mileage:xxx,start_loc:{lng,lat},last_province:xxx}}
	var near_city
	for(var i in locations){
		var loc = locations[i]
		var last_city
		var last_distance = 0
		if(near_city){
			last_distance = distance(loc.lat,loc.lng,near_city.geo.lat,near_city.geo.lng)
			if(last_distance>fuzzy){
				// console.log('distance from',near_city.province_name,'[',near_city.name,']','is',last_distance)
				last_city = near_city
				near_city = null
			}
		}
		if(!near_city){
			near_city = db.city.sync.findOne({geo:{$near:[loc.lat,loc.lng]}},{_id:0,geo:1,province_name:1,name:1})
			var l = get_city_info(last_city)
			var n = get_city_info(near_city)
			// if(l.province!=n.province)
			// 	console.log('location change from',l.province,'to',n.province,'at',loc.lat,loc.lng,'with distance',last_distance.toFixed(2),'at',new Date(loc.timestamp))
		}
		calc(loc_map,near_city.province_name,loc)
	}
	callback(null,loc_map)
})}

module.exports.statistic = statistic