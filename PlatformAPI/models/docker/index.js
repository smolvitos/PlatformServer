const mongoose = require('mongoose')

const DockerSchema = mongoose.Schema({
	baseImage: {
		type: String,
    	unique: true,
    	required: true
	},
	serviceName: {
    	type: String,
    	unique: true,
    	required: true
  	},
    serviceShortDescription: {
        type: String,
        maxlength: 100
    },
  	serviceDescription: {
    	type: String,
    	required: true
  	}
})

const DockerModel = mongoose.model('dockerimages', DockerSchema)

module.exports = DockerModel