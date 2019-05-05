//const configs = require('./configs/properties')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const routerRegAuth = require('./routes/regAuth')
const routerLoadImage = require('./routes/loadImage')
const initPassport = require('./configs/passport').init //добавление стратегии JWT
const passport = initPassport(require('passport'))
//const users = initPassport.users
//const jwtOptions = initPassport.jwtOptions
//const jwt = require('jsonwebtoken')

const app = express()

app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(bodyParser.json())
app.use(passport.initialize())
app.use(morgan('dev'))
app.use(cors())
app.use(routerRegAuth)
app.use(routerLoadImage)

app.get('/', (req, res) => {
	res.json({ message: 'Express is up!'})
})

/*app.post('/login', (req, res) => {
	let username = req.body.username
	let password = req.body.password
	let user = users[_.findIndex(users, { username: username })]
	console.log(`------${user}------`)

	if (!user) {
		res.status(401).json({ message: 'No such user'})
	}

	if (user.password === password) {
		let payload = { id: user.id }
		let token = jwt.sign(payload, jwtOptions.secretOrKey)
		res.json({ message: 'ok', token: token })
	} else {
		res.status(401).json('Wrong password')
	}
})*/

app.get('/secret', 
	passport.authenticate('jwt', { session: false } ),
	(req, res) => {
		res.json('Hi, authorized user!!!')
	}
)

module.exports = app