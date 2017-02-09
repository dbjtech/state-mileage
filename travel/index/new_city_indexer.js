const fs = require('fs')
const events = require('events')
const es = require('event-stream')
const fibrous = require('fibrous')
const Promise = require('bluebird')
const co = require('co')

const readFile = Promise.promisify(fs.readFile)

const config = require('../config.js')
const db = require('../common/db.js')

const emitter = new events.EventEmitter()
let timestamp = Date.now()
let cities = []
let count = 0

function log_and_time(str) {
	let now = Date.now()
	console.log(str, '[time used', now - timestamp, 'ms]')
	timestamp = now
}

function commit(cityList) {
	return new Promise((resolve, reject) => {
		console.log('commiting', cityList.length, 'docs')
		db.city.insert(cityList, (err) => {
			if (err) reject(err)
			resolve()
		})
	})
}

function start() {
	console.log('init')
	db.init('city')
	setTimeout(() => {
		db.city.ensureIndex({
			geo: '2d',
		}, db.default_db_callback)
		log_and_time('finished init')
		emitter.emit('index_provinces')
	}, 100)
}
start()


emitter.once('index_provinces', () => {
	let provinces = {}
	console.log('index city names')

	co(function* () {
		let line = yield readFile(config.raw.province, 'utf8')
		let rowArr = line.split('\n')

		for (let one of rowArr) {
			let row = one.split('\t')
			let city = {
				code: row[0].split('.'),
				name: row[1],
			}
			provinces[city.code[0]] = provinces[city.code[0]] || {}
			provinces[city.code[0]][city.code[1]] = city.name
		}
	}).catch(console.error)
	log_and_time('finished indexing city names')
	emitter.emit('index_city_locations', provinces)
})


emitter.once('index_city_locations', (provinces) => {
	console.log('index city locations')
	let line_number = 0
		// this method is non-block

	fs.createReadStream(config.raw.city, {
		flags: 'r',
	}).pipe(es.split()).pipe(es.through((line) => {
		let row = line.split('\t')
		line_number++
		let city = {}
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
		if (city.province_name) {
			cities.push(city)
		} else {
			console.log('warn province name not found', city.country_code, city.province_code, city.name, 'in line', line_number)
		}
		if (cities.length % 20000 === 0 && cities.length >= 20000) {
			count++
		}
	})).pipe(es.wait((err) => {
		if (err) console.error(err)
		emitter.emit('cities array operation', cities)
	}))
})

emitter.once('cities array operation', (citiList) => {
	console.log('operating citiesList')
	console.log('count:', count)
	let res = Promise.coroutine(function* () {
		for (let i = 0; i < count; i++) {
			let cityArr = citiList.splice(0, 20000)
			console.log('this is No.', i)
			yield commit(cityArr)
		}
		if (citiList.length) {
			yield commit(citiList)
		}
		emitter.emit('exit')
		log_and_time('finished indexing city locations.')
	})
	res()
})

emitter.once('exit', () => {
	fibrous.run(() => {
		console.log('exiting')
		db.mongodb.close()
	})
})
