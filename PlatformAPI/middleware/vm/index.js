const VmModel = require('../../models/vm')
const formidable = require('formidable')

module.exports.listVms = () => (req, res) => {
    VmModel.find({}, (err, vms) => {
        if (err) {
            res.status(500).json({
                status: 'failed',
                message: `${err.message}`
            })
        }
        res.json(vms)
    })
}

module.exports.updateVm = () => (req, res) => {
    var form = new formidable.IncomingForm()
    form.parse(req, function(err, fields, files) {
        VmModel.updateOne(
            { 
                _id: fields._id 
            },
            { 
                vmName: fields.vmName,
                vmDescription: fields.vmDescription,
                vmShortDescription: fields.vmShortDescription,
                vmIpHost: fields.vmIpHost,
                vmPorts: fields.vmPorts
            },
            (error, writeOpResult) => {
                if (error) {
                    res.status(500).json({
                        status: 'failed',
                        message: error.message
                    })
                }
                console.log(writeOpResult)
                res.json({
                    status: 'success',
                    message: `Vm ${fields._id} (${fields.vmName}) has been updated`
                })
            }
        )
    })
}

module.exports.deleteVm = () => (req, res) => {
	VmModel.deleteOne(
            { 
                _id: req.body._id 
            },
            (error, result) => {
                if (error) {
                    res.status(500).json({
                        status: 'failed',
                        message: error.message
                    })
                }
                console.log(result)
                res.json({
                    status: 'success',
                    message: `Vm ${req.body._id} (${req.body.vmName}) has been deleted`
                })
            }
        )
}
