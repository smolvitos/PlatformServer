const UserModel = require('../../models/user')
const formidable = require('formidable')
const bcrypt = require('bcrypt')
const DockerModel = require('../../models/docker')

module.exports.listUsers = () => (req, res) => {
    UserModel.find({}, (err, users) => {
        if (err) {
            res.status(500).json({
                status: 'failed',
                message: `${err.message}`
            })
        }
        res.json(users)
    })
}

module.exports.getUserInfo = () => (req, res) => {
    UserModel.findOne({ username: req.user.username }, (err, user) => {
        if (err) {
            res.status(500).json({
                status: 'failed',
                message: `${err.message}`
            })
        }
        delete user.password
        res.json(user)
    })
}

module.exports.deleteUser = () => (req, res) => {
    UserModel.deleteOne(
            { 
                _id: req.body._id 
            },
            (error, result) => {
                if (error) {
                    res.status(500).json({
                        status: 'failed',
                        message: error.message
                    })
                }
                console.log(result)
                res.json({
                    status: 'success',
                    message: `User ${req.body._id} (${req.body.username}) has been deleted`
                })
            }
        )
}

module.exports.checkFlag = () => (req, res) => { //task_name{ddfgd65461dfdf}
    flagToCheck = req.body.flag
    serviceName = flagToCheck.split("{")[0]
    console.log(`${flagToCheck} ${serviceName}`)
    DockerModel.findOne({ "serviceName": serviceName })
		.then((service) => {
            if (!service) throw new Error("Неверный флаг!")
			if (!service.trueAnswers.includes(flagToCheck)) {
                throw new Error("Неверный флаг!")
            }
            //значит, флаг действительно верный, заносим его в профиль пользователя, предварительно выполнив проверки

		})
        .then(() => UserModel.findOne({ username: req.user.username }))
        .then((user) => {
            if (user.passedFlags.includes(flagToCheck)) { //если флаг сдается пользователем повторно
                throw new Error("Флаг уже был сдан!")
            }
            user.passedFlags.push(flagToCheck)
            UserModel.updateOne({ username: req.user.username }, { passedFlags: user.passedFlags })
            .then((result) => {
                if (result) {
                    return res.json({
                        status: 'success',
                        message: `Флаг успешно сдан!`
                    })
                }
            })
            .catch((error) => reject(error))
        })
        .catch((error) => {
            return res.status(500).json({
                                status: 'failed',
                                message: error.message
                            })
        })
    /*
    UserModel.deleteOne(
            { 
                _id: req.body._id 
            },
            (error, result) => {
                if (error) {
                    res.status(500).json({
                        status: 'failed',
                        message: error.message
                    })
                }
                console.log(result)
                res.json({
                    status: 'success',
                    message: `User ${req.body._id} (${req.body.username}) has been deleted`
                })
            }
        )
        */
}

module.exports.editUser = () => (req, res) => {
    var form = new formidable.IncomingForm()
    form.parse(req, function(err, fields, files) {
        let userObj = {
            _id: fields._id,
            username: fields.username,
            firstName: fields.firstName,
            lastName: fields.lastName,
            gender: fields.gender,
            age: fields.age
        }
        if (fields.password) {
            userObj["password"] = fields.password
            bcrypt.genSalt(10, (error, salt) => {
			if (error) return next(error)
			bcrypt.hash(userObj.password, salt, (error, hash) => {
				if (error) return next(error)
				userObj.password = hash
                updateUser(userObj, res)
            })
            })
        } else { 
            updateUser(userObj, res) 
        }
			})
		}

function updateUser(userObj, res) {
    UserModel.updateOne(
                    { 
                        _id: userObj._id 
                    },
                    userObj,
                    (error, writeOpResult) => {
                        if (error) {
                            res.status(500).json({
                                status: 'failed',
                                message: error.message
                            })
                        }
                        console.log(writeOpResult)
                        res.json({
                            status: 'success',
                            message: `Vm ${userObj._id} (${userObj.username}) has been updated`
                        })
                    }
                )
}