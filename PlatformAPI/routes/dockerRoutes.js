const express =require('express')
const router = express.Router()
const dockerAPI = require('../middleware/docker/')

router.get('/api/v1/services/list', dockerAPI.listServices())
router.post('/api/v1/services/start', dockerAPI.startService()) //work
router.post('/api/v1/services/pause', dockerAPI.pauseService()) //work
router.post('/api/v1/services/stop', dockerAPI.stopService()) // work
router.post('/api/v1/services/delete', dockerAPI.deleteService()) //work

module.exports = router