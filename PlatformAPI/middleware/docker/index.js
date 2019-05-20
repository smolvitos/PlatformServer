//Сбор информации от сервиса Docker и из БД
const { Docker } = require('node-docker-api')
const DockerModel = require('../../models/docker')

const docker = new Docker({ socketPath: '/var/run/docker.sock' })
let dockerServicesGlobal = []

module.exports.listServices = () => (req, res) => {
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
				return DockerModel.find({ baseImage: /dockerService.baseImage/i }).exec()
				.addBack((err, info) => {
					//if (err) console.error(err)
					console.log(info)
					for (let container of containers) { //может быть меньше, чем образов
						//console.log(container)
						let  { Names, Image, State, Ports } = container.data

						if (dockerService['baseImage'].split(':')[0] == Image) {
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
					console.log(dockerService)
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