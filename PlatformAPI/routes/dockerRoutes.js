const express =require('express')
const router = express.Router()
const dockerAPI = require('../middleware/docker/')
const initPassport = require('../configs/passport').init
const passport = initPassport(require('passport'))
const jwtOptions = require('../configs/passport').jwtOptions

router.get('/api/v1/services/list', passport.authenticate('jwt', {session: false}), dockerAPI.listServices())
router.post('/api/v1/services/start', dockerAPI.startService()) //work
router.post('/api/v1/services/pause', dockerAPI.pauseService()) //work
router.post('/api/v1/services/stop', dockerAPI.stopService()) // work
router.post('/api/v1/services/delete', dockerAPI.deleteService()) //work

module.exports = router