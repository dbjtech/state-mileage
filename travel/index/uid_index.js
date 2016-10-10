const fs = require('fs')
const argvUtil = require('../utils/argvUtil.js')
const Excel = require('exceljs')
const Promise = require('bluebird')
const csv = Promise.promisifyAll(require('csv'))
const path = require('path')
const mkdirp = require('mkdirp')

let fileData = fs.readFileSync(argvUtil.argv.uid)
let sheets = {}


function createExcel(name, rows) {
	let workbook = new Excel.Workbook()
	let sheet = workbook.addWorksheet('Sheet')
	for (let row of rows) {
		sheet.addRow(row)
	}
	if (fs.existsSync(argvUtil.argv.output)) {
		return workbook.xlsx.writeFile(path.join(argvUtil.argv.output, `${name}.xlsx`))
	}
	mkdirp(argvUtil.argv.output)
	return workbook.xlsx.writeFile(path.join(argvUtil.argv.output, `${name}.xlsx`))
}


const exportXlsx = function* () {
	let rows = yield csv.parseAsync(fileData)
	let titles = rows.shift()
	for (let row of rows) {
		let key = row[0]
		sheets[key] = sheets[key] || [titles]
		sheets[key].push(row)
	}

	for (let k in sheets) {
		let v = sheets[k]
		yield createExcel(k, v)
		console.log('export', k)
	}
}

module.exports.exportXlsx = exportXlsx
