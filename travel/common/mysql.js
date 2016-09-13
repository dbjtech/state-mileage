var config = require('../config.js')
var mysql = require('mysql')

var db = {connection:null}
function handleDisconnect() {
	// Recreate the connection, since the old one cannot be reused.
	if(!config.mysql) return
	db.connection = mysql.createConnection(config.mysql)
	console.log('mysql connected')	
	db.connection.connect(function(err) {
		if(err) {
			console.log('mysql', err)
			setTimeout(handleDisconnect, 2000);
		}
	})

	db.connection.on('error', function(err) {
		console.log('mysql', err)
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
			handleDisconnect()                         // lost due to either server restart, or a
		} else {                                      // connnection idle timeout (the wait_timeout
			throw err                                  // server variable configures this)
		}
	})
}
handleDisconnect()


module.exports = db