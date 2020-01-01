//Сбор информации от сервиса Docker и из БД
const { Docker } = require('node-docker-api')
const DockerModel = require('../../models/docker')
const formidable = require('formidable')

const docker = new Docker({ socketPath: '/var/run/docker.sock' })
let dockerServicesGlobal = []

function listServices() {
    return (req, res) => {
        docker.image.list() //список образов
        .then((images) => {
            //console.log(images)
            Promise.all(images.map((image) => {
                return image.status()
                .then((imageInfo) => {
                    let  { RepoTags } = imageInfo.data
                    return {
                        _id: null,
                        containerName: null,
                        baseImage: RepoTags[0],
                        state: null,
                        ports: null,
                        serviceName: null,
                        serviceDescription: null,
                        serviceShortDescription: null
                    }
                })
            })) //в конце концов вернули типизированный объект сервиса как элемент массива (все через параллельную обработку)
            .then((dockerServices) => {
                dockerServicesGlobal = dockerServices //резервирование
            })
        })
        .then(() => {
            docker.container.list({all: true})
            .then((containers) => { //теперь учитываем, что могут уже быть контейнеры
                Promise.all(dockerServicesGlobal.map((dockerService) => {
                    //console.log(dockerService.baseImage)
                    return DockerModel.findOne({ baseImage: new RegExp(dockerService.baseImage, 'i') }).exec()
                    .then((info) => {
                        //if (err) console.error(err)
                        console.log(info)
                        for (let container of containers) { //может быть меньше, чем образов
                            console.log(container)
                            let  { Names, Image, State, Ports } = container.data

                            if (~dockerService['baseImage'].indexOf(Image)) { //Image < dockerService['baseImage']
                                console.log(`${Names[0]} ${Image} ${State} ${Ports}`)
                                return {
                                    _id: info ? info._id : null,
                                    containerName: Names[0],
                                    baseImage: Image,
                                    state: State,
                                    ports: Ports,
                                    serviceName: info ? info.serviceName : null,
                                    serviceDescription: info ? info.serviceDescription : null,
                                    serviceShortDescription: info ? info.serviceShortDescription : null
                                }
                            }
                        }
                        dockerService._id = info._id
                        dockerService.serviceName = info.serviceName
                        dockerService.serviceDescription = info.serviceDescription
                        dockerService.serviceShortDescription = info.serviceShortDescription
                        //console.log(dockerService)
                        return dockerService
                    })
                    .catch((error) => {
                        return dockerService
                    })
                }))
                .then((servicesForClient) => {
                    res.json(servicesForClient)
                })
            })
        })
        .catch((error) => console.log(error))
    }
}

module.exports.listServices = listServices

module.exports.updateService = () => (req, res) => {
    var form = new formidable.IncomingForm()
    form.parse(req, function(err, fields, files) {
        DockerModel.updateOne(
            { 
                _id: fields._id 
            },
            { 
                serviceName: fields.servicename,
                serviceDescription: fields.description,
                serviceShortDescription: fields.shortdescription
            },
            (error, writeOpResult) => {
                if (error) {
                    return res.status(500).json({
                        status: 'failed',
                        message: error.message
                    })
                }
                console.log(writeOpResult)
                res.json({
                    status: 'success',
                    message: `Service ${fields._id} (${fields.servicename}) has been updated`
                })
            }
        )
    })
}

module.exports.startService = () => (req, res) => {  //input JSON {state, baseImage, containerName}
	if (!req.body.state) {
		docker.container.create({
  			Image: req.body.baseImage,
  			Detach: true,
            PublishAllPorts: true
		})
		.then((container) => {
			container.start()
            .then((container) => {
                res.json({
                    status: 'success',
				    message: `Image ${req.body.baseImage} has been started.`
			    })
            })
		})
        .catch((error) => {
            res.status(500).json({
                status: 'failed',
                message: error.message
            })
        })
	} else {
		let opts = {
			"filters": `{"name": ["${req.body.containerName}"], "status": ["exited", "running", "dead","paused"]}`
		}

		docker.container.list(opts)
		.then((containers) => {
			return containers[0].start()
        })
        .then((container) => {
            res.json({
                status: 'success',
				message: `Container ${req.body.containerName} has been started.`
			})
        })
        .catch((error) => {
            res.status(500).json({
                status: 'failed',
                message: error.message
            })
        })
	}
}

module.exports.pauseService = () => (req, res) => { //input JSON {state, containerName}
	if (req.body.state != 'running') {
		return res.json({
			status: 'failed',
            message: 'wrong operation'
		})
	}

	let opts = {
		"filters": `{"name": ["${req.body.containerName}"], "status": ["running"]}`
	}

	docker.container.list(opts)
	.then((container) => {
		return container[0].stop()
    })
    .then((container) => {
        res.json({
            status: 'success',
			message: `${req.body.containerName} has been paused.`
		})
    })
	.catch((error) => {
		res.status(500).json({
            status: 'failed',
            message: error.message
        })
	})
}

module.exports.stopService = () => (req, res) => { //input JSON {state, containerName}
	if (req.body.state != 'running' && req.body.state != 'exited') {
		return res.json({
			status: 'failed',
            message: 'wrong operation'
		})
	}

	let opts = {
		"filters": `{"name": ["${req.body.containerName}"], "status": ["exited", "running"]}`
	}

	docker.container.list(opts)
	.then((containers) => {
		return containers[0].stop()
    })
    .then((container) => {
		return container.delete()
    })    
    .then((container) => {
        res.json({
            status: 'success',
		    message: `${req.body.containerName} has been stopped`
		})
    })
	.catch((error) => {
		res.status(500).json({
            status: 'failed',
            message: error.message
        })
	})
}

module.exports.deleteService = () => (req, res) => { //input JSON {state, baseImage, containerName}
	if (!req.body.containerName) {
		//удалить только образ
		docker.image.get(req.body.baseImage).status()
		.then((image) => {
			console.log(image)
			return image.remove()
        })
        .then((image) => {
            return DockerModel.findOneAndRemove({ baseImage: new RegExp(req.body.baseImage, 'i') }).exec()
        })
        .then((info) => {
            res.json({
                status: 'success',
				message: `${req.body.baseImage} has been deleted.`
			})
        })
		.catch((error) => {
			res.status(500).json({
                status: 'failed',
                message: error.message
            })
		})
	} else {
		//удалить контейнеры, а затем образ
		let opts = {
			"filters": `{"name": ["${req.body.containerName}"], "status": ["exited", "running", "dead"]}`
		}

		docker.container.list(opts)
		.then((containers) => containers[0].stop())
		.then(container => container.delete())
        .then(container => docker.image.get(req.body.baseImage).status())
        .then(image => image.remove())
        .then(() => {
            return DockerModel.findOneAndRemove({ baseImage: new RegExp(req.body.baseImage, 'i') }).exec()
        })
        .then((info) => {
            res.json({
                status: 'success',
				message: `${req.body.baseImage} has been deleted with container`
			}) 
        })
        .catch((error) => {
			res.status(500).json({
                status: 'failed',
                message: error.message
            })
		})
    }	
}
