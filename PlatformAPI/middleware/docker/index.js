//Сбор информации от сервиса Docker и из БД. Связь
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
				  	status: null,
				  	ports: null
			  	}
			})
		}))
		.then((dockerServices) => {
			dockerServicesGlobal = dockerServices
		})
		.then(() => {
			return docker.container.list({all: true})
			.then((containers) => {
				Promise.all(containers.map((container) => {
					return container.status()
					.then((containerInfo) => {
						let  { Name } = containerInfo.data
			  				,{ Image } = containerInfo.data.Config
			  				,{ Status } = containerInfo.data.State
			  				,{ Ports } = containerInfo.data.NetworkSettings
			  			
			  			for (let dockerService of dockerServicesGlobal) {
			  				//console.log(dockerService)
			  				//console.log(Image)
			  				if (dockerService['baseImage'].split(':')[0] == Image) {
			  					return {
			  						containerName: Name,
								  	baseImage: Image,
								  	status: Status,
								  	ports: Ports
			  					}
			  				} else {
			  					return dockerService
			  				}
			  			}
					})
				}))
				.then((servicesForClient) => {
					console.log(servicesForClient)
				})
			})
		})
	})
	.catch((error) => console.log(error))
}

		/*return new Promise((resolve, reject) => {
			let dockerServices = []
			images.forEach((image, number) => {
				image.status()
				.then((imageInfo) => {
					//console.log(imageInfo)
					let  { RepoTags } = imageInfo.data
				
					let dockerService = {
				  			containerName: null,
				  			baseImage: RepoTags[0],
				  			status: null,
				  			ports: null
			  		}
			  		//console.log(dockerServices)
			  		dockerServices.push(dockerService)
			  		if (images.length - 1 == number) {
			  			//console.log(dockerServices)
			  			resolve(dockerServices)
			  		}
				})			
			})
		})
	})
	.then((dockerServices) => {
		//console.log(dockerServices) ok
		docker.container.list({all: true})
		.then((containers) => {
			containers.forEach((container, number) => {
			container.status()
			.then((containerInfo) => {
				let  { Name } = containerInfo.data
			  		,{ Image } = containerInfo.data.Config
			  		,{ Status } = containerInfo.data.State
			  		,{ Ports } = containerInfo.data.NetworkSettings
			  	//console.log(dockerServices)
			  	//console.log(typeof tools)
			  	console.log(tools.checkForUpdate(dockerServices, { baseImage: Image + ':latest' }))
			  	//console.log('serviceAsContainer')

			  	//изменение объекта dockerServices
			  	/*let dockerService = {
		  			containerName: Name,
		  			baseImage: Image,
		  			status: Status,
		  			ports: Ports
	  			}
	  			console.log(dockerService) //только информация от Docker
			})
			
			})
		})
	})*/

	/*docker.container.list({all: true})
	.then((containers) => {
		containers.forEach((container, number) => {
			container.status()
			.then((containerInfo) => {
				let  { Name } = containerInfo.data
			  		,{ Image } = containerInfo.data.Config
			  		,{ Status } = containerInfo.data.State
			  		,{ Ports } = containerInfo.data.NetworkSettings
			  	
			  	let dockerService = {
		  			containerName: Name,
		  			baseImage: Image,
		  			status: Status,
		  			ports: Ports
	  			}
	  			console.log(dockerService) //только информация от Docker
			})
			
		})
	})
	.catch((error) => console.log(error))*/
// images[1].data.RepoTags
// images - Array
// RepoTags - Array