var express = require('express')
var router = express.Router()
var base = '/shifts'

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect(base + '/auth/login');
}

// /* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  // console.log(req.session)
    res.render('shifts', {page: 'Shift Management', menuId: 'home', user: req.user, "institutes": array_of_institutes})
})

var today = Date.now()
var oneYearAgo = new Date(Number(today) - 31556952000);

// console.log(`Today is ${Date(today)}. One Year ago today was ${oneYearAgo.toString()}`)

/* GET Userlist page. */
router.get('/fulldirectory', ensureAuthenticated, function(req, res) {
  var positions_arr = ["Engineer", "Master Student", "Non-permanent Sci.", "Other Student", "Permanent Scientist", 
                   "PhD Student", "PI", "Postdoc", "Staff", "Thesis Student", "XENON Student"]
  res.render('fulldirectory', {page: 'Full Directory', 
                                menuId: 'home',
                                positions: positions_arr,
                                "institutes": array_of_institutes,
                                user: req.user})
})

router.post("/curr_table_info", ensureAuthenticated, function(req, res){
	var db = req.xenonnt_db
  var order = ['PI', "Permanent Scientist", "Non-permanent Sci.", "PhD Student", "Thesis Student", "XENON Student", "Engineer"]
  var users = []
  // If valid show all users in that institute
  db.collection('users').find({"position": "PI", "end_date": {$exists: false}}, {"sort": "institute"}).toArray(function(err, pi) {
    for (i = 0; i < pi.length; i++) {
      pi[i]['current_user'] = req.user
      users.push(pi[i])
    }
    db.collection('users').find({"position": "Permanent Scientist", "end_date": {$exists: false}}, {"sort": "institute"}).toArray(function(err, ps) {
      for (i = 0; i < ps.length; i++) {
        ps[i]['current_user'] = req.user
        users.push(ps[i])
      }
      db.collection('users').find({"position": "Non-permanent Sci.", "end_date": {$exists: false}}, {"sort": "institute"}).toArray(function(err, nps) {
        for (i = 0; i < nps.length; i++) {
          nps[i]['current_user'] = req.user
          users.push(nps[i])
        }
        db.collection('users').find({"position": "PhD Student", "end_date": {$exists: false}}, {"sort": "institute"}).toArray(function(err, phd) {
          for (i = 0; i < phd.length; i++) {
            phd[i]['current_user'] = req.user
            users.push(phd[i])
          }
          db.collection('users').find({"position": "Thesis Student", "end_date": {$exists: false}}, {"sort": "institute"}).toArray(function(err, ts) {
            for (i = 0; i < ts.length; i++) {
              ts[i]['current_user'] = req.user
              users.push(ts[i])
            }
            db.collection('users').find({"position": "XENON Student", "end_date": {$exists: false}}, {"sort": "institute"}).toArray(function(err, xs) {
              for (i = 0; i < xs.length; i++) {
                xs[i]['current_user'] = req.user
                users.push(xs[i])
              }
              db.collection('users').find({"position": {$not: {$in: order}}, "end_date": {$exists: false}}, {"sort": "institute"}).toArray(function(err, o) {
                for (i = 0; i < o.length; i++) {
                  o[i]['current_user'] = req.user
                  users.push(o[i])
                }
                res.send(JSON.stringify({"data": users}));
              })
            })
          })
        })
      })
    })
  })
});

router.post("/prev_table_info", ensureAuthenticated, function(req, res){
	var db = req.xenonnt_db

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
  var db = req.xenonnt_db
  db.collection('users').find({start_date: {$lt: oneYearAgo}}, {"sort": "last_name"}).toArray((e, docs) => {
    res.render('authors', {page: 'Author List', menuId: 'home', "data": docs, user: req.user})
  })
})

router.post("/curr_author_table", ensureAuthenticated, function(req, res){
  var db = req.xenonnt_db
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
  var db = req.xenonnt_db
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