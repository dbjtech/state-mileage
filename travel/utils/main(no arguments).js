const fs = require('fs')
const _ = require('lodash')
const Excel = require('exceljs')
const co = require('co')
const user_index = require('./index/index.js')
const locreader = require('./loc_reader.js')
const Promise = require('promise')

const read_xlsx = function(path) {
	return new Promise((resolve, reject) => {
		fs.readdir(path, (err, data) => {
			if (err) return reject(err)
			resolve(data)
		})
	})
}


const gen2 = function* () {
	let files = yield read_xlsx('../split')
	for (let filename of files) {
		const workbook = new Excel.Workbook()
		if (filename.match(/\.xlsx$/)) {
			yield (workbook.xlsx.readFile('./index/' + filename))
			console.log('parsing', filename)
			let worksheet = workbook.getWorksheet()
			let tnCol = worksheet.getColumn(4)
			tnCol.eachCell((cell, rowNumber) => {
				if (cell.value === '[object Object]') {
					let row = worksheet.getRow(rowNumber)
					cell.value = ''
					row.commit()
				}
			})
			yield workbook.xlsx.writeFile('./index/' + filename)
			console.log('write succeed')
		}
	}
}

const gen = function* () {
	yield user_index.exportXlsx()
	let files = yield read_xlsx('./index')
	let result = yield locreader.get_distance()
	for (let filename of files) {
		const workbook = new Excel.Workbook()
		if (filename.match(/\.xlsx$/)) {
			yield (workbook.xlsx.readFile('./index/' + filename))
			console.log('parsing', filename)
			let worksheet = workbook.getWorksheet()
			for (let k = 0; k < result.length; k++) {
				let loc_tid = _.dropRight(result[k]['File'].split('.'))
				let tidCol = worksheet.getColumn(2)
				tidCol.eachCell((cell, rowNumber) => {
					// console.log(cell.value)
					if (cell.value === loc_tid[0]) {
						let pro_name = _.drop(_.keys(result[k]))
						let row = worksheet.getRow(1)
						let n = 5
						for (let name of pro_name) {
							if (row.getCell(n).value === null) {
								row.getCell(n).value = name
								n++
							}
						}
						row.commit()
						let row2 = worksheet.getRow(rowNumber)
						let dis_arr = _.drop(_.values(result[k]))
						for (let u = 0; u < dis_arr.length; u++) {
							if (dis_arr[u] === '') {
								dis_arr.splice(u, 1, ' ')
							}
						}
						console.log('dis_arr:', dis_arr)
						let c = 5
						for (let d of dis_arr) {
							row2.getCell(c).value = d
							c++
						}
						row2.commit()
					}
				})
			}
			yield workbook.xlsx.writeFile('./index/' + filename)
		}
	}
	yield* gen2()
}

co(gen).then(console.info).catch(console.error)

// files.forEach((filename) => {
// 		fs.readFile('./xlsx/' + filename, 'utf-8', (err, data) => {
// 			// console.log(filename)
// 			if (err) console.error(err)
// 			console.log(filename, ':', data)
// 		})
// 	})
