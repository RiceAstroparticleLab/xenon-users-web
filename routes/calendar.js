var express = require('express')
var router = express.Router()


/* GET home page. */
router.get('/', function(req, res, next) {
      res.render('calendar', {page: 'Home', menuId: 'home', user: req.user})
})

module.exports = router