var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('landing', { title: 'Under Construction' })
  })

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
  var db = req.dbx
  // console.log(db)
  db.collection('users').find().toArray((e,docs) => {
      res.render('userlist', {
          "userlist" : docs
      })
  })
})

module.exports = router