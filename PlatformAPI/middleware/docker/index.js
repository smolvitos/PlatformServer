//Сбор информации от сервиса Docker и из БД
const { Docker } = require('node-docker-api')
const DockerModel = require('../../models/docker')

const docker = new Docker({ socketPath: '/var/run/docker.sock' })
let dockerServicesGlobal = []

function listServices() {
    return (req, res) => {
        docker.image.list()
        .then((images) => {
            //console.log(images)
            Promise.all(images.map((image) => {
                return image.status()
                .then((imageInfo) => {
                    let  { RepoTags } = imageInfo.data
                    return {
                        containerName: null,
                        baseImage: RepoTags[0],
                        state: null,
                        ports: null,
                        serviceName: null,
                        serviceDescription: null
                    }
                })
            }))
            .then((dockerServices) => {
                dockerServicesGlobal = dockerServices
            })
        })
        .then(() => {
            docker.container.list({all: true})
            .then((containers) => {
                Promise.all(dockerServicesGlobal.map((dockerService) => {
                    //console.log(dockerService.baseImage)
                    return DockerModel.findOne({ baseImage: new RegExp(dockerService.baseImage, 'i') }).exec()
                    .then((info) => {
                        //if (err) console.error(err)
                        console.log(info)
                        for (let container of containers) { //может быть меньше, чем образов
                            console.log(container)
                            let  { Names, Image, State, Ports } = container.data

                            if (dockerService['baseImage'] == Image) {
                                console.log(`${Names[0]} ${Image} ${State} ${Ports}`)
                                return {
                                    containerName: Names[0],
                                    baseImage: Image,
                                    state: State,
                                    ports: Ports,
                                    serviceName: info ? info.serviceName : null,
                                    serviceDescription: info ? info.serviceDescription : null
                                }
                            }
                        }
                        dockerService.serviceName = info.serviceName
                        dockerService.serviceDescription = info.serviceDescription
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

module.exports.startService = () => (req, res) => {  //input JSON {state, baseImage, containerName}
	if (!req.body.state) {
		docker.container.create({
  			Image: req.body.baseImage,
  			Detach: true
		})
		.then((container) => {
			container.start()
			res.json({
				status: `Image ${req.body.baseImage} has been started.`
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
			containers[0].start()
			res.json({
				status: `Container ${req.body.containerName} has been started.`
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
			status: 'wrong operation'
		})
	}

	let opts = {
		"filters": `{"name": ["${req.body.containerName}"], "status": ["running"]}`
	}

	docker.container.list(opts)
	.then((container) => {
		container[0].stop()
		res.json({
			status: `${req.body.containerName} has been paused.`
		})
	})
	.catch((error) => {
		res.json(error.stack)
	})
}

module.exports.stopService = () => (req, res) => { //input JSON {state, containerName}
	if (req.body.state != 'running' && req.body.state != 'exited') {
		return res.json({
			status: 'wrong operation'
		})
	}

	let opts = {
		"filters": `{"name": ["${req.body.containerName}"], "status": ["exited", "running"]}`
	}

	docker.container.list(opts)
	.then((containers) => {
		containers[0].stop()
		.then((container) => {
			container.delete()
			res.json({
				status: `${req.body.containerName} has been stopped`
			})
		})
	})
	.catch((error) => {
		res.json(error.message)
	})
}

module.exports.deleteService = () => (req, res) => { //input JSON {state, baseImage, containerName}
	if (!req.body.containerName) {
		//удалить только образ
		docker.image.get(req.body.baseImage).status()
		.then((image) => {
			console.log(image)
			image.remove()
			res.json({
				status: `${req.body.baseImage} has been deleted`
			})
		})
		.catch((error) => {
			res.json(error.message)
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
			res.json({
				status: `${req.body.baseImage} has been deleted with container`
			} ) 
        })
		.catch((error) => {
			res.json(error.message)
		})
	}
}
