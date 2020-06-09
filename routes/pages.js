var express = require('express')
var router = express.Router()

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/auth/login')
}

// /* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session)
    res.render('home', {page: 'Home', menuId: 'home', user: req.user})
})

var today = Date.now()
var oneYearAgo = new Date(Number(today) - 31556952000);

console.log(`Today is ${Date(today)}. One Year ago today was ${oneYearAgo.toString()}`)
var cur_institute

/* GET Userlist page. */
router.get('/fulldirectory', function(req, res) {
  var db = req.test_db
  var current = []
  var prev = []
  db.collection('users').find({}, {"sort": "last_name"}).toArray((e,docs) => {
    for (i = 0; i < docs.length; i++) {
      if(!docs[i].end_date) {
        if(docs)
        current.push(docs[i])
      } else {
        prev.push(docs[i])
      }
    }
    res.render('fulldirectory', {page: 'Full Directory', menuId: 'home', "curr": current, "prev": prev, user: req.user})
  })
})

/* GET List of Authors page. */
router.get('/authors', function(req, res) {
  var db = req.test_db
  var current = []
  var prev = []
  db.collection('users').find({start_date: {$lt: oneYearAgo}}, {"sort": "last_name"}).toArray((e, docs) => {
    for (i = 0; i < docs.length; i++) {
      if(!docs[i].end_date) {
        if(docs)
        current.push(docs[i])
      } else {
        prev.push(docs[i])
      }
    }
    res.render('fulldirectory', {page: 'Author List', menuId: 'home', "curr": current, "prev": prev, user: req.user})
  })
})

/* GET New User page. */
router.get('/newuser', function(req, res) {
  res.render('newuser', { page: 'New User', cur_institute: `${cur_institute}`, menuId: 'home', title: 'Add New User', user: req.user});
});

// Dealing with profiles
router.get('/profile', ensureAuthenticated, function(req, res){
  // console.log(req.session)
  // res.send(`Profile for the user: ${req.user.first_name} ${req.user.last_name}`)
  res.render('profile', { page: 'Profile', menuId: 'home', title: `${req.user.first_name} ${req.user.last_name}`, user: req.user });
});

module.exports = router