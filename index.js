const app = require('./PlatformAPI/')
const configs = require('./PlatformAPI/configs/properties')
const port = process.env.PORT || configs.expressPort

const mongoose = require('mongoose')
mongoose.connect(configs.dbURL, configs.dbOptions)
mongoose.Promise = global.Promise

const db = mongoose.connection

db
	.on('error', console.error.bind(console, 'DB connection failed :('))
	.on('connected', () => console.log(`Connected to maindb`))
	.on('disconnected', () => console.log(`Disconnected from maindb`))
	.once('open', () => {
		console.log('MongoDB has been started')

		app.listen(port, (error) => {
	  		if (error) {
	    		throw error
	  		}
	  		console.log(`Server is listening on ${port}...`)
		})
	})