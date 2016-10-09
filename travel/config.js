module.exports = {
	db:{
		// type:'tingodb',
		// path:'database',
		type:'mongodb',
		path:'mongodb://localhost:27017/server?auto_reconnect=true&socketTimeoutMS=600000',
	},
	mysql:{
		host: 'localhost',
		port: 3306,
		user: 'root',
		password: '',
		database: 'cloudhawk',
		sql: 'SELECT * FROM T_LOCATION WHERE tid="89302720396911973407" AND category=1 AND latitude!=0 AND longitude!=0;'
	},
	raw:{
		province:'../raw/admin1CodesASCII.txt',
		//city:'raw/allCountries.txt',
		city:'../raw/US.txt',
	}
}