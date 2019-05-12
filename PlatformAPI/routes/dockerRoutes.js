const express =require('express')
const router = express.Router()
const dockerAPI = require('../middleware/docker/')

router.get('/api/v1/services/list', dockerAPI.listServices())

module.exports = router