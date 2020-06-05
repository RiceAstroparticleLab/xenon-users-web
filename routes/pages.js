var express = require('express')
var router = express.Router()

// /* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home', {page: 'Home', menuId: 'home'})
})

var today = Date.now()
var oneYearAgo = new Date(Number(today) - 31556952000);

console.log(`Today is ${Date(today)}. One Year ago today was ${oneYearAgo.toString()}`)
var cur_institute

/* GET Userlist page. */
router.get('/fulldirectory', function(req, res) {
  var db = req.recode_db
  db.collection('users').find({}, {"sort": "last_name"}).toArray((e,docs) => {
    res.render('fulldirectory', {page: 'Full Directory', menuId: 'home', "data": docs})
  })
})

/* GET List of Authors page. */
router.get('/authors', function(req, res) {
  var db = req.recode_db
  db.collection('users').find({start_date: {$lt: oneYearAgo}}, {"sort": "last_name"}).toArray((e, docs) => {
    res.render('fulldirectory', {page: 'Author List', menuId: 'home', "data": docs})
  })
})

/* GET New User page. */
router.get('/newuser', function(req, res) {
  res.render('newuser', { page: 'New User', cur_institute: `${cur_institute}`, menuId: 'home', title: 'Add New User' });
});

module.exports = router