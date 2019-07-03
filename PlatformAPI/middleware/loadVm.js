const VmModel = require('../models/vm')
const formidable = require('formidable')

module.exports = (req, res, next) => {
    var form = new formidable.IncomingForm()
    form.parse(req, function(err, fields, files) {
        console.log(fields)
        const vmEntity = new VmModel({
            vmName: fields.vmName, //regExp for parsing is required (will added later)
            vmIpHost: fields.vmIpHost,
            vmPorts: fields.vmPorts.split(','),
            vmShortDescription: fields.vmShortDescription,
            vmDescription: fields.vmDescription,
            trueAnswers: fields.trueAnswers.split(',')
        })
        vmEntity.save((err, data) => {
            if (err) {
                res.status(400).json({
                    status: 'failed',
                    message: err.message
                })
            } else {
                res.json({
                    status: 'success',
                    message: `VM ${data.vmName} has been loaded on the server`
                })
            }
        })
    })
}