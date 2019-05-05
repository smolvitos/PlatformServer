const mongoose = require('mongoose')

const DockerSchema = mongoose.Schema({
	serviceImage: {
		type: String,
    	unique: true,
    	required: true
	},
	serviceName: {
    	type: String,
    	unique: true,
    	required: true
  	},
  	serviceDescription: {
    	type: String,
    	required: true
  	}
})

const DockerModel = mongoose.model('dockerimages', DockerSchema)

module.exports = DockerModel