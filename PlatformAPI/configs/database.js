const mongoose = require('mongoose')

const database = mongoose.connection
mongoose.Promise = Promise
mongoose.connect(configs.database, {
	useMongoClient: true,
	promiseLibrary: global.Promise
})

database.on('error', (error) => console.log(`Connection to maindb failed, because: ${error}`))
database.on('connected', () => console.log(`Connected to maindb`))
database.on('disconnected', () => console.log(`Disconnected from maindb`))

process.on('SIGINT', () => {
    database.close(() => {
    	console.log('Platform terminated, connection closed');
    	process.exit(0);
    })
})

module.exports = mongoose