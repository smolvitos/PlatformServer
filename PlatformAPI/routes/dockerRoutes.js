const express =require('express')
const router = express.Router()
const dockerAPI = require('../middleware/docker/')
const vmAPI = require('../middleware/vm/')
const initPassport = require('../configs/passport').init
const passport = initPassport(require('passport'))
const jwtOptions = require('../configs/passport').jwtOptions
const checkPrivileges = require('../middleware/docker/checkPrivileges')

router.get('/api/v1/services/list', passport.authenticate('jwt', {session: false}), dockerAPI.listServices())
router.post('/api/v1/services/start', passport.authenticate('jwt', {session: false}), checkPrivileges, dockerAPI.startService()) //work
router.post('/api/v1/services/pause', passport.authenticate('jwt', {session: false}), checkPrivileges, dockerAPI.pauseService()) //work
router.post('/api/v1/services/stop', passport.authenticate('jwt', {session: false}), checkPrivileges, dockerAPI.stopService()) // work
router.post('/api/v1/services/delete', passport.authenticate('jwt', {session: false}), checkPrivileges, dockerAPI.deleteService()) //work
router.post('/api/v1/services/update', passport.authenticate('jwt', {session: false}), checkPrivileges, dockerAPI.updateService()) // work
router.get('/api/v1/vms/list', passport.authenticate('jwt', {session: false}), vmAPI.listVms()) //
router.post('/api/v1/vms/update', passport.authenticate('jwt', {session: false}), checkPrivileges, vmAPI.updateVm()) //
router.post('/api/v1/vms/delete', passport.authenticate('jwt', {session: false}), checkPrivileges, vmAPI.deleteVm()) //


module.exports = router