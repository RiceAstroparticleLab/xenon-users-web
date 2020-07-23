var express = require('express')
var router = express.Router()
var base = '/shifts'

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect(base + '/auth/login');
}

// /* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  console.log(req.session)
    res.render('shifts', {page: 'Shift Management', menuId: 'home', user: req.user})
})

var today = Date.now()
var oneYearAgo = new Date(Number(today) - 31556952000);

console.log(`Today is ${Date(today)}. One Year ago today was ${oneYearAgo.toString()}`)

/* GET Userlist page. */
router.get('/fulldirectory', ensureAuthenticated, function(req, res) {
  var db = req.recode_db
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
    res.render('fulldirectory', {page: 'Full Directory', menuId: 'home', "curr": current, "prev": prev, "institutes": array_of_institutes, user: req.user})
  })
})

router.post("/curr_table_info", ensureAuthenticated, function(req, res){
	var db = req.recode_db

  // If valid show all users in that institute
  db.collection('users').find({"end_date": {$exists: false}}, {"sort": "institute"}).toArray(function(err, result) {
    for (i = 0; i < result.length; i++) {
      result[i]['current_user'] = req.user
    }
		  res.send(JSON.stringify({"data": result}));
  })
    
});

router.post("/prev_table_info", ensureAuthenticated, function(req, res){
	var db = req.recode_db

  // If valid show all users in that institute
  db.collection('users').find({"end_date": {$exists: true}}, {"sort": "institute"}).toArray(function(err, result) {
    for (i = 0; i < result.length; i++) {
      result[i]['current_user'] = req.user
    }
		  res.send(JSON.stringify({"data": result}));
  })
    
});

/* GET List of Authors page. */
router.get('/authors', ensureAuthenticated, function(req, res) {
  var db = req.recode_db
  db.collection('users').find({start_date: {$lt: oneYearAgo}}, {"sort": "last_name"}).toArray((e, docs) => {
    res.render('authors', {page: 'Author List', menuId: 'home', "data": docs, user: req.user})
  })
})

router.post("/curr_author_table", ensureAuthenticated, function(req, res){
  var db = req.recode_db
  var current = []
  db.collection('users').find({start_date: {$lt: oneYearAgo}}, {"sort": "last_name"}).toArray((e, docs) => {
    for (i = 0; i < docs.length; i++) {
      if(!docs[i].end_date) {
        docs[i]['current_user'] = req.user
        current.push(docs[i])
      } 
    }
    res.send(JSON.stringify({"data": current}));
  })
})

router.post("/prev_author_table", ensureAuthenticated, function(req, res){
  var db = req.recode_db
  var prev = []
  db.collection('users').find({start_date: {$lt: oneYearAgo}, 
                                end_date: {$gt: oneYearAgo}}, 
                              {"sort": "last_name"}).toArray((e, docs) => {
    for (i = 0; i < docs.length; i++) {
      var end = new Date(Number(docs[i].end_date) - 31556952000)
      var start = new Date(Number(docs[i].start_date))
      if(start < end && docs[i].end_date) {
        docs[i]['current_user'] = req.user
        prev.push(docs[i])
      }
    }
    res.send(JSON.stringify({"data": prev}));
  })
})

// Dealing with profiles
router.get('/profile', ensureAuthenticated, function(req, res){
  res.render('profile', { page: 'Profile', 
                          menuId: 'home', 
                          title: `${req.user.first_name} ${req.user.last_name}`, 
                          user: req.user 
                        });
});

module.exports = router