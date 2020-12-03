var express = require('express');
var router = express.Router();
var base = '/shifts';
var today = Date.now()
var oneYearAgo = new Date(Number(today) - 31556952000);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect(base + '/auth/login');
}

// GET home page.
router.get('/', ensureAuthenticated, function(req, res) {
  res.render('shifts', 
    { page: 'Shift Management', 
      menuId: 'home', 
      user: req.user, 
      institutes: array_of_institutes
    }
  );
});

// external form.
router.get('/request_new_member', function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('users');

  collection.distinct(
    "institute", 
    {$exists: {end_date: false}}
  ).toArray(function(e, docs) {
    res.render('request', 
      { page: 'Request New Member', 
        menuId: 'home', 
        title: 'Request New Member',
        insitutes: docs
      }
    );
  });
});

// confirmation of external form
router.get('/confirmation', function(req, res) {
  res.render('confirmation_lander', {page: 'Request Confirmed', menuId: 'home', title: 'Request Confirmed'})
});

// external form.
router.get('/remove_user', ensureAuthenticated, function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('users');

  collection.find(
    {end_date: {$exists: false}, position: {$ne: "PI"}}
  ).toArray(function(e, docs) {
    res.render('removeUser', 
      { page: 'Remove a User', 
        menuId: 'home', 
        title: 'Remove a User',
        data: docs,
        user: req.user
      }
    );
  });
});

// GET Userlist page. 
router.get('/fulldirectory', ensureAuthenticated, function(req, res) {
  // array declares positions for autocomplete
  var positionsArr = [
    'Engineer', 'Master Student', 'Non-permanent Sci.', 'Other Student', 
    'Permanent Scientist', 'PhD Student', 'PI', 'Postdoc', 'Staff', 
    'Thesis Student', 'XENON Student'
  ];
  res.render('fulldirectory', 
    { page: 'Full Directory', 
      menuId: 'home',
      positions: positionsArr,
      "institutes": array_of_institutes,
      user: req.user
    }
  );
});

// GET List of Authors page.
router.get('/authors', ensureAuthenticated, function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  // this search probably has to be refined more but currently only 
  // checks for people who started more than a year ago.
  collection.find(
    {start_date: {$lt: oneYearAgo}}, 
    {"sort": "last_name"}
  ).toArray(function(e, docs) {
    res.render('authors', 
      { page: 'Author List',
        menuId: 'home', 
        data: docs, 
        user: req.user
      }
    );
  });
});

// GET profile page
router.get('/profile', ensureAuthenticated, function(req, res){
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var name = req.user.first_name + ' ' + req.user.last_name;
  collection.find({"pending": true}).toArray(function(err, doc) {
    res.render('profile', 
    { page: 'Profile', 
      menuId: 'home',
      pending: doc,
      slackLink: process.env.SLACK_INVITE, 
      title: name, 
      user: req.user, 
    }
  );
  });
});

// get the information about all current users from mongo for fulldirectory
router.post("/curr_table_info", ensureAuthenticated, function(req, res){
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var users = [];
  var order = [
    'PI', 'Permanent Scientist', 'Non-permanent Sci.', 'PhD Student', 
    'Thesis Student', 'XENON Student', 'Engineer', 'Technician', '?'
  ];
  // This particular search is done with nested queries because I couldn't
  // figure out a good way to sort the positions the way I wanted. Probably
  // not the best way to go about it.
  collection.find(
    { 
      "position": "PI", 
      "end_date": {$exists: false},
      "pending": {$exists: false}
    }, 
    {"sort": "institute"}
  ).toArray(function(err, pi) {
    for (let i = 0; i < pi.length; i++) {
      pi[i]['current_user'] = req.user;
      users.push(pi[i]);
    }
    collection.find(
      { 
        "position": "Permanent Scientist", 
        "end_date": {$exists: false},
        "pending": {$exists: false}
      }, 
      {"sort": "institute"}
    ).toArray(function(err, ps) {
      for (let i = 0; i < ps.length; i++) {
        ps[i]['current_user'] = req.user;
        users.push(ps[i]);
      }
      collection.find(
        { 
          "position": "Non-permanent Sci.", 
          "end_date": {$exists: false},
          "pending": {$exists: false}
        }, 
        {"sort": "institute"}
      ).toArray(function(err, nps) {
        for (let i = 0; i < nps.length; i++) {
          nps[i]['current_user'] = req.user;
          users.push(nps[i]);
        }
        collection.find(
          {
            "position": "PhD Student", 
            "end_date": {$exists: false},
            "pending": {$exists: false}
          }, 
          {"sort": "institute"}
        ).toArray(function(err, phd) {
          for (let i = 0; i < phd.length; i++) {
            phd[i]['current_user'] = req.user;
            users.push(phd[i]);
          }
          collection.find(
            {
              "position": "Thesis Student", 
              "end_date": {$exists: false},
              "pending": {$exists: false}
            }, 
            {"sort": "institute"}
          ).toArray(function(err, ts) {
            for (let i = 0; i < ts.length; i++) {
              ts[i]['current_user'] = req.user;
              users.push(ts[i]);
            }
            collection.find(
              {
                "position": "XENON Student", 
                "end_date": {$exists: false},
                "pending": {$exists: false}
              }, 
              {"sort": "institute"}
            ).toArray(function(err, xs) {
              for (let i = 0; i < xs.length; i++) {
                xs[i]['current_user'] = req.user;
                users.push(xs[i]);
              }
              collection.find(
                { 
                  "position": {$not: {$in: order}}, 
                  "end_date": {$exists: false},
                  "pending": {$exists: false}
                }, 
                {"sort": "institute"}
              ).toArray(function(err, o) {
                for (i = 0; i < o.length; i++) {
                  o[i]['current_user'] = req.user;
                  users.push(o[i]);
                }
                res.send(JSON.stringify({"data": users}));
              });
            });
          });
        });
      });
    });
  });
});

// get the information about all previous users from mongo for fulldirectory
router.post("/prev_table_info", ensureAuthenticated, function(req, res){
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  collection.find(
    {"position": {$not: {$in: ["Technician", "Engineer", "?"]}},
    "end_date": {$exists: true}}, 
    {"sort": "institute"}
  ).toArray(function(err, result) {
    for (let i = 0; i < result.length; i++) {
      result[i]['current_user'] = req.user;
    }
		res.send(JSON.stringify({"data": result}));
  });
});

// get the information about all engineers and technicians from mongo for fulldirectory
router.post("/tech_table", ensureAuthenticated, function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var users = [];
  // This particular search is done with nested queries because I couldn't
  // figure out a good way to sort the positions the way I wanted. Probably
  // not the best way to go about it.
  collection.find(
    { 
      "position": {$in: ["Engineer", "Technician", "?"]}, 
      "end_date": {$exists: false},
      "pending": {$exists: false}
    }, 
    {"sort": "institute"}
  ).toArray(function(err, result) {
    for (let i = 0; i < result.length; i++) {
      result[i]['current_user'] = req.user;
    }
		res.send(JSON.stringify({"data": result}));
  });
});

router.post("/prev_tech_table", ensureAuthenticated, function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var users = [];
  // This particular search is done with nested queries because I couldn't
  // figure out a good way to sort the positions the way I wanted. Probably
  // not the best way to go about it.
  collection.find(
    { 
      "position": {$in: ["Engineer", "Technician", "?"]}, 
      "end_date": {$exists: true},
      "pending": {$exists: false}
    }, 
    {"sort": "institute"}
  ).toArray(function(err, result) {
    for (let i = 0; i < result.length; i++) {
      result[i]['current_user'] = req.user;
    }
    res.send(JSON.stringify({"data": result}));
  });
});

// get information about all current members from mongo for the author list
router.post("/curr_author_table", ensureAuthenticated, function(req, res){
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var current = [];

  collection.find(
    {start_date: {$lt: oneYearAgo}}, 
    {"sort": "last_name"}
  ).toArray(function(e, docs) {
    for (let i = 0; i < docs.length; i++) {
      if(!docs[i].end_date) {
        docs[i]['current_user'] = req.user;
        current.push(docs[i]);
      } 
    }
    res.send(JSON.stringify({"data": current}));
  });
});

// get information about all previous members from mongo for the author list
router.post("/prev_author_table", ensureAuthenticated, function(req, res){
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var prev = []
  // make sure they were at xenon for longer than a year but havent been gone
  // for longer than a year
  collection.find(
    { 
      start_date: {$lt: oneYearAgo}, 
      end_date: {$gt: oneYearAgo}
    }, 
    {"sort": "last_name"}
  ).toArray(function(e, docs) {
    for (let i = 0; i < docs.length; i++) {
      let end = new Date(Number(docs[i].end_date) - 31556952000);
      let start = new Date(Number(docs[i].start_date));
      if(start < end && docs[i].end_date) {
        docs[i]['current_user'] = req.user;
        prev.push(docs[i]);
      }
    }
    res.send(JSON.stringify({"data": prev}));
  });
});

module.exports = router