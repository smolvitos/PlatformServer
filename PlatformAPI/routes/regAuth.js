const UserModel = require('../models/user')
const express =require('express')
const router = express.Router()
const initPassport = require('../configs/passport').init
const passport = initPassport(require('passport'))
const jwtOptions = require('../configs/passport').jwtOptions
const jwt = require('jsonwebtoken')

router.post('/register', (req, res) => {
	const user = new UserModel({
		username: req.body.username,
		password: req.body.password,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		age: req.body.age,
		gender: req.body.gender,
        isAdmin: false
	})
	console.log(`${req.body.username} ${req.body.password}`)

	user.save((error, data) => {
		if (error) { 
			res.status(400).json({
				status: 'failed',
				message: 'Wrong input data. Check them and try again'
			})
		} else {
			console.log(data)
			res.json({
				status: 'success',
				message: `User with ID ${data._id} has been saved successfully`
			})
		}
	})
})

router.post('/login', (req, res) => {
	const username = req.body.username
	const password = req.body.password
	UserModel.findOne({ username }, (error, user) => {
		if (error) {
			res.status(401).json({
				status: 'failed',
				message: `Something wrong! ${error}`
			})
		}

		if (!user) {
			res.status(401).json({
				status: 'failed',
				message: `User ${username} doesn't exists`
			})
		} else {
			user.comparePassword(password, (error, matches) => {
				if (error) {
					//console.log(password)
					res.status(401).json({
						status: 'failed',
						message: `Something wrong! ${error.stack}`
					})
				} else if (!matches) {
					console.log(matches)
					res.status(401).json({
						status: 'failed',
						message: `Wrong password ${password}`
					})
				} else {
					let payload = {
                        username: user.username,
                        isAdmin: user.isAdmin
                    }
					let token = jwt.sign(payload, jwtOptions.secretOrKey)
					res.json({
						status: 'success',
						message: `User ${user.username} has been authorized`,
						token,
                        isAdmin: true
					})
				}
			})
		}
	})
})


router.get('/secret2', passport.authenticate('jwt', {session: false}), (req,res) => {
	res.json({text: 'This is form secret'})
})
module.exports = router
