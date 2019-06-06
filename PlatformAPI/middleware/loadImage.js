const exec = require('child_process').exec
const formidable = require('formidable')
const util = require('util')
const async = require('async')
const path = require('path')
const mv = require('mv')
const DockerModel = require('../models/docker')

module.exports = (req, res, next) => {
    var form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.maxFileSize = 500 * 1024 * 1024
    form.uploadDir = '/root/diplom_app/uploaded_images'
    form.parse(req, function(err, fields, files) {
    	console.log(fields)
        async.parallel(Object.keys(files).map(function(name) {
            var file = files[name]
            if (file.type.indexOf("application/x-tar") === 0) {
                return (callback) => {
                    const dockerImageFullName = path.join(path.dirname(file.path), file.name)
                    mv(file.path, dockerImageFullName, (err) => {
                        if (err) {
                            let error = new Error("Error while rename uploaded Docker Image")
                            return callback(error)
                        }

                        const child = exec(`docker load -q < ${dockerImageFullName}`, (err, stdout, stderr) => {
                            if (err) {
                                return callback(err)
                            }
                            const dockerEntity = new DockerModel({
                            	baseImage: stdout, //regExp for parsing is required (will added later)
                            	serviceName: fields.servicename,
                                serviceShortDescription: fields.shortdescription,
                            	serviceDescription: fields.description
                            })

                            dockerEntity.save((err, data) => {
                                if (err) return callback(new Error(err.message))
                                console.log(`stdout ${stdout}`)
                                callback(null, `Image ${file.name} has been loaded. DockerImage ${file.name} has been loaded and avaible in ${form.uploadDir}`)
                            })
                            
                        })
                    })
                }
            } else {
                return (callback) => {
                    callback(new Error("Isn't Docker Image"))
                }
            }
        }), (err, data) => { //итоговый callback
            if (err) {
                res.status(400).json({
                    message: err.message
                })
            } else {
                res.json({
                    message: data[0]
                })
            }
        })
    })
}