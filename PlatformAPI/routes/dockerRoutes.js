const express =require('express')
const router = express.Router()
const dockerAPI = require('../middleware/docker/')
const initPassport = require('../configs/passport').init
const passport = initPassport(require('passport'))
const jwtOptions = require('../configs/passport').jwtOptions
const checkPrivileges = require('../middleware/docker/checkPrivileges')

router.get('/api/v1/services/list', passport.authenticate('jwt', {session: false}), dockerAPI.listServices())
router.post('/api/v1/services/start', passport.authenticate('jwt', {session: false}), checkPrivileges, dockerAPI.startService()) //work
router.post('/api/v1/services/pause', passport.authenticate('jwt', {session: false}), checkPrivileges, dockerAPI.pauseService()) //work
router.post('/api/v1/services/stop', passport.authenticate('jwt', {session: false}), checkPrivileges, dockerAPI.stopService()) // work
router.post('/api/v1/services/delete', passport.authenticate('jwt', {session: false}), checkPrivileges, dockerAPI.deleteService()) //work

module.exports = router