//Сбор информации от сервиса Docker и из БД. Связь
const { Docker } = require('node-docker-api')

const docker = new Docker({ socketPath: '/var/run/docker.sock' })
let dockerServices = []
let tools = {}

tools.checkForUpdate = (whereCompare, whatCompare) => {
	let keys = Object.keys(whatCompare)
	//console.log(whereCompare)
	//console.log(whatCompare[keys[0]])
	let status = false
	let k = 0
	keys.forEach((key, i) => {
		whereCompare.forEach((obj, j) => {
			k += 500
			if (obj[key]) {
				if (obj[key] == whatCompare[key]) {
					status = true
					//console.log('true')
				} else {
					status = false
				}
			} else {
				status = false
			}
		})
	})
	console.log(k)
	return status
}

module.exports.listServices = () => (req, res) => {
	docker.image.list()
	.then((images) => {
		//console.log(images)
		
		return new Promise((resolve, reject) => {
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
	  			console.log(dockerService) //только информация от Docker*/
			})
			
			})
		})
	})
	.catch((error) => console.log(error))
	
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
}

// images[1].data.RepoTags
// images - Array
// RepoTags - Array