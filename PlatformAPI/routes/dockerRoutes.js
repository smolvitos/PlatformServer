const express =require('express')
const router = express.Router()
const dockerAPI = require('../middleware/docker/')
const vmAPI = require('../middleware/vm/')
const usersAPI = require('../middleware/users/')
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
router.get('/api/v1/users/list', passport.authenticate('jwt', {session: false}), checkPrivileges, usersAPI.listUsers()) //
router.post('/api/v1/users/delete', passport.authenticate('jwt', {session: false}), checkPrivileges, usersAPI.deleteUser()) //
router.post('/api/v1/users/edit', passport.authenticate('jwt', {session: false}), checkPrivileges, usersAPI.editUser()) //
router.post('/api/v1/users/checkflag', passport.authenticate('jwt', {session: false}), usersAPI.checkFlag()) //
router.get('/api/v1/users/getuserinfo', passport.authenticate('jwt', {session: false}), usersAPI.getUserInfo()) //


module.exports = router