const mongoose = require('mongoose')

const VmSchema = mongoose.Schema({
	vmName: {
    	type: String,
    	unique: true,
    	required: true
  	},
    vmIpHost: {
        type: String,
        required: true 
    },
    vmPorts: {
        type: Array,
        required: false
    },
    vmShortDescription: {
        type: String,
        maxlength: 100,
        required: false
    },
  	vmDescription: {
    	type: String,
    	required: false
  	},
    trueAnswers: {
        type: Array,
        required: false
    }
})

const VmModel = mongoose.model('vms', VmSchema)

module.exports = VmModel