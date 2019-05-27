const {Docker} = require('node-docker-api')
const request = require('request')
const fs = require('fs')
const exec = require('child_process').exec
const child = exec('docker load < ffffff_im.tar', (err, stdout, stderr) => {
	if (err) console.error(err)
	console.log(`stdout ${stdout}`)
})

/*
 
const docker = new Docker({ socketPath: '/var/run/docker.sock' })
//console.log(docker)

docker.container.create({
	Image: 'linode/lamp',
	name: 'node_test'
})
	.then(container => container.start())
	.catch(error => console.log(error));
	

var data

let stream = new fs.ReadStream('./ffffff_im.tar')
stream.on('readable', () => {
	data += stream.read()
	//console.log(data.length)
})
stream.on('error', (error) => {
	console.log(error.stack)
})
stream.on('end', () => {
	console.log(data.length)
	let options = {
		method: 'POST',
		uri: 'http://localhost:1111/images/load',
		'Content-Type': 'application/x-tar',
		'Content-Length': data.length
	}
	stream.pipe(
		request(options)
	).pipe(fs.createWriteStream('resp.txt'))
})*/
