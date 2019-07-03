const express =require('express')
const router = express.Router()
const loadImage = require('../middleware/loadImage')
const loadVm = require('../middleware/loadVm')

router.get('/load', (req, res) => {
	res.send(`<form enctype="multipart/form-data" method="post" action="/load">
   <p><input type="file" name="f">
   <input type="submit" value="Отправить"></p>
  </form>`)
})

router.post('/loaddocker', loadImage)
router.post('/loadvm', loadVm)

module.exports = router