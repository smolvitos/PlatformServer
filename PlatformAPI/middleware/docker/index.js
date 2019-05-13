//Сбор информации от сервиса Docker и из БД
const { Docker } = require('node-docker-api')

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
				  	ports: null
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
				for (let container of containers) {
					console.log(container)
					let  { Names, Image, State, Ports } = container.data
			  		console.log(container.data.NetworkSettings.Networks)
					if (dockerService['baseImage'].split(':')[0] == Image) {
						console.log(`${Names[0]} ${Image} ${State} ${Ports}`)
						return {
							containerName: Names[0],
				  			baseImage: Image,
				  			state: State,
				  			ports: Ports
						}
					}
				}
				return dockerService
			}))
			.then((servicesForClient) => {
				res.json(servicesForClient)
			})
		})
	})
	.catch((error) => console.log(error))
}