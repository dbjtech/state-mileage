const argv = require('yargs')
	.options('o', {
		alias: 'output',
		demand: true,
		describe: 'the filefolder which contains uid.xlsx is supposed to be read',
		type: 'string',
	})
	.options('u', {
		alias: 'uid',
		demand: true,
		describe: 'the rawUidData you want to read',
		type: 'string',
	})
	.options('l', {
		alias: 'locations',
		demand: true,
		describe: 'the filefolder which contains tid.csv is supposed to be read',
		type: 'string',
	})
	.usage('Usage: $0 <command> [options]')
    .example('$0 -u ../split/a/rawData.csv -o ../test/ -l ./locations/',
	'-u points to the position of rawData,-o points to the position of uid.xlsx',
	'-l points to the position of tid.csv')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright Lee @2016')
    .argv

module.exports.argv = argv
