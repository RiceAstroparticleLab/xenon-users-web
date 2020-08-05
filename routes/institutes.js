var express = require("express")
var router = express.Router()
var base = '/shifts'

// var Highcharts = require('highcharts');  
// // Load module after Highcharts is loaded
// require('highcharts/modules/exporting')(Highcharts);  

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect(base + '/auth/login');
}

/* GET Institutes List page. */
router.get('/', ensureAuthenticated, function(req, res) {
  res.render('institutes', {page:'Institutes', menuId:'home', "institutes": array_of_institutes, user: req.user});
})

/* GET individual institution page. */
router.get('/:institute', ensureAuthenticated, function(req, res) {
    var db = req.xenonnt_db
    var given_inst = req.params.institute
    cur_institute = given_inst
    console.log(`Institute: ${given_inst}`)
  
    // Stats for this institute
    var find_institute 

     // Hard code Muenster/Munster, UCSD/UC San Diego, Uchicago/Chicago, and Bern-Freiburg/Freiburg because they 
    // are the same institutes but come up under different names on the db
    for (i = 0; i < array_of_institutes.length; i++) {
      if (array_of_institutes[i][0] == given_inst) {
        if (array_of_institutes[i].length > 1) {
        var alternate_institute = array_of_institutes[i][1]
        break;
        }
      }
    }
    console.log(alternate_institute)

    if (alternate_institute) {
      find_institute = db.collection('users').find({"end_date": {$exists: false}, $or: [{"institute": given_inst}, {"institute": alternate_institute}]}, {"sort": "last_name"})
    } else {
      find_institute = db.collection('users').find({"institute": given_inst, "end_date": {$exists: false}}, {"sort": "last_name"})
    }
  
    // If valid show all users in that institute
    find_institute.toArray((e, docs) => {
      var dict = {};
      var pi = [];
      // Team Stats
      for (i = 0; i < docs.length; i++) {
        var position_str = `${docs[i].position}`
        if (position_str === "PI") {
          pi.push(docs[i])
        } else {
          if(dict[`${position_str}`]) {
            dict[`${position_str}`] += 1
          } else {
            dict[`${position_str}`] = 1
          }
        }
      }
      
      // console.log(pi)
      // console.log(dict)

      var current = []
      var prev = []
      for (i = 0; i < docs.length; i++) {
        if(!docs[i].end_date) {
          if(docs)
          current.push(docs[i])
        } else {
          prev.push(docs[i])
        }
      }

      console.log(req.user.groups)
  
      res.render('institute_stats', {page: `${ given_inst }`, 
        menuId: 'home', 
        "PI": pi,
        "dict": dict,
        "curr": current, 
        "prev": prev,
        "institutes": array_of_institutes,
        user: req.user})
    })
  
  })

/* GET New User page. */
router.get('/:institute/newuser', ensureAuthenticated, function(req, res) {
  var cur_institute = req.params.institute
  res.render('newuser', { page: 'New User', cur_institute: `${cur_institute}`, menuId: 'home', title: 'Add New User', user: req.user});
});

  module.exports = router