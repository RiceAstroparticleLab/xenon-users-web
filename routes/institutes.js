var express = require("express")
var router = express.Router()

/* GET Institutes List page. */
router.get('/', function(req, res) {
  // var db = req.test_db
  var db = recode_db
  var array = []
  
  db.collection('users').distinct("institute", (e, docs) => {
    // Hard code some exceptions
    for (i = 0; i < docs.length; i++) {
      if (docs[i] === "Bern/Freiburg" || docs[i] === null || docs[i] === "Munster" || docs[i] === "Other" || docs[i] === "UCSD" || docs[i] === "Chicago" || docs[i] === "LNGS") {
        // console.log(`Institute not inserted: ${docs[i]}`)
      } else {
        //console.log(docs[i])
        array.push(docs[i])
      }
    }
    // console.log(`GET array: ${array}`);
    res.render('institutes', {page:'Home', menuId:'home', "data": array, user: req.user});
  })
})

/* GET individual institution page. */
router.get('/:institute', function(req, res) {
    //var db = req.test_db
    var db = req.test_db
    var given_inst = req.params.institute
    cur_institute = given_inst
    console.log(`Institute: ${given_inst}`)
  
    // Stats for this institute
    var find_institute
    // Hard code Muenster/Munster, UCSD/UC San Diego, Uchicago/Chicago, and Bern-Freiburg/Freiburg because they 
    // are the same institutes but come up under different names on the db
    if (given_inst === "Freiburg") {
      find_institute = db.collection('users').find({$or: [{"institute": given_inst}, {"institute": "Bern/Freiburg"}]}, {"sort": "last_name"})
    } else if (given_inst === "Muenster") {
      find_institute = db.collection('users').find({$or: [{"institute": given_inst}, {"institute": "Munster"}]}, {"sort": "last_name"})
    } else if (given_inst === "UC San Diego") {
      find_institute = db.collection('users').find({$or: [{"institute": given_inst}, {"institute": "UCSD"}]}, {"sort": "last_name"})
    } else if (given_inst === "UChicago") {
      find_institute = db.collection('users').find({$or: [{"institute": given_inst}, {"institute": "Chicago"}]}, {"sort": "last_name"})
    } else if (given_inst === "LNGS-GSSI") {
      find_institute = db.collection('users').find({$or: [{"institute": given_inst}, {"institute": "LNGS"}]}, {"sort": "last_name"})
    } else {
      find_institute = db.collection('users').find({"institute": given_inst}, {"sort": "last_name"})
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
          position_str = position_str.toLowerCase()
          position_str = position_str[0].toUpperCase() + position_str.slice(1)
          if(dict[`${position_str}`]) {
            dict[`${position_str}`] += 1
          } else {
            dict[`${position_str}`] = 1
          }
        }
      }
      
      console.log(pi)
      console.log(dict)

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
  
      res.render('institute_stats', {page: `${ given_inst }`, 
        menuId: 'home', 
        "PI": pi,
        "dict": dict,
        "curr": current, 
        "prev": prev,
        user: req.user})
    })
  
  })

/* GET New User page. */
router.get('/:institute/newuser', function(req, res) {
  var cur_institute = req.params.institute
  res.render('newuser', { page: 'New User', cur_institute: `${cur_institute}`, menuId: 'home', title: 'Add New User', user: req.user});
});

  module.exports = router