const express =require('express')
const router = express.Router()
const dockerAPI = require('../middleware/docker/')

router.get('/api/v1/services/list', dockerAPI.listServices())
router.post('/api/v1/services/start', dockerAPI.startService()) //+
router.post('/api/v1/:containerName/pause', dockerAPI.pauseService())
router.post('/api/v1/:containerName/stop', dockerAPI.stopService())
router.post('/api/v1/services/delete', dockerAPI.deleteService()) //+

module.exports = router