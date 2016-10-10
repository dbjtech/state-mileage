var _ = require('underscore')
const _l = require('lodash')
var es = require('event-stream')
var fs = require('fs')
var events = require('events')
var db = require('./common/db.js')
var surveyor = require('./common/surveyor.js')
const path = require('path')

var emitter = new events.EventEmitter()
var all_loc = {}
const argvUtil = require('./utils/argvUtil.js')
var files = fs.readdirSync(argvUtil.argv.locations)

db.init('city')
db.ensureIndex('city', {
	"geo": "2d"
})

emitter.on('pop file', function() {
	if (files.length) {
		var file = files.pop()
		if (file.match(/\.csv$/))
			emitter.emit('parse file', path.join(argvUtil.argv.locations, file))
		else
			emitter.emit('pop file')
	} else {
		emitter.emit('parse done')
	}
})

var table = {
	'File': _.clone(files).reverse()
}
var table_row = 0

emitter.on('parse file', function(file) {
	console.log('parse', file)
	var mode
	fs.createReadStream(file, {
		flags: 'r'
	}).pipe(es.split()).pipe(es.through(function(line) {
		var row = line.split(',')
		if (row[0] == 'Time') {
			mode = 'text'
		} else if (row[0] == 'timestamp') {
			mode = 'raw'
		} else if (!row[0]) {
			// console.log('parse end')
		} else {
			var loc = {}
			if (mode == 'raw') {
				loc.timestamp = Number(row[0]) * 1000
				loc.lng = Number(row[2]) / 3600000
				loc.lat = Number(row[1]) / 3600000
			} else {
				loc.timestamp = new Date(row[0]).getTime() + Math.random()
				loc.lng = Number(row[1])
				loc.lat = Number(row[2])
			}
			if (all_loc[loc.timestamp]) {
				var old_loc = all_loc[loc.timestamp]
				if (old_loc.lng != loc.lng || old_loc.lat != loc.lat)
					console.log('warn', file, old_loc, 'confict', loc)
			} else {
				all_loc[loc.timestamp] = loc
			}
		}
	})).pipe(es.wait(function(err, text) {
		surveyor.statistic(db, all_loc, 1, function(err, rs) {
			delete rs.last_province
			for (var k in rs) {
				table[k] = table[k] || []
				table[k][table_row] = rs[k].mileage.toFixed(2)
				console.log(k, '\t', rs[k].mileage.toFixed(2))
			}
			table_row++
			var sum = _.isEmpty(rs) ?
				0 : _.reduce(_.pluck(_.values(rs), 'mileage'), function(sum, num) {
					return sum + num
				})
			console.log('total', sum.toFixed(2))
			all_loc = {}
			emitter.emit('pop file')
		})
	}))
})


const get_distance = () => {
	let p = new Promise(resolve => {
		emitter.on('parse done', resolve)
	})

	let p2 = p.then(() => {
		let line_arr
		let result = []
		let distance_arr = []
		let pro_arr = _l.keys(table)
		for (let i = 0; i < table_row; i++) {
			var line = ''
			for (let j in table) {
				if (line) line += '\t'
				line += table[j][i] || ''
			}
			line_arr = line.split('\t')
			let tmp = {}
			let tmpLine = line_arr
			let len = tmpLine.length <= pro_arr.length ? tmpLine.length : pro_arr.length
			for (let k = 0; k < len; k++) {
				tmp[pro_arr[k]] = line_arr[k]
			}
			distance_arr = tmp
			result.push(distance_arr)
		}
		return result
	})
	return p2
}

emitter.on('parse done', () => {
	// get_distance()
	db.mongodb.close()
	console.log('done')
})

emitter.emit('pop file')


module.exports.get_distance = get_distance

