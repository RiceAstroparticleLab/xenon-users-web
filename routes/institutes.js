var express = require("express")
var router = express.Router()

/* GET Institutes List page. */
router.get('/', function(req, res) {
    // var db = req.test_db
    var db = req.recode_db
    db.collection('users').distinct("institute", (e, docs) => {
      var array = []
      // Remove any '/' from names
      for (i = 0; i < docs.length; i++) {
        if (docs[i] != null) {
          var inst = `${docs[i]}`.replace('/', '-')
          array.push(inst)
        }
      }
      res.render('institutes', {page:'Home', menuId:'home', "data": array, user: req.user});
    })
  })

/* GET individual institution page. */
router.get('/:institute', function(req, res) {
    //var db = req.test_db
    var db = req.recode_db
    var given_inst = req.params.institute
    cur_institute = given_inst
    console.log(`Institute: ${given_inst}`)
  
    //Look up institution if not a valid institute, send error
  
    // Stats for this institute
    var pi
    db.collection('users').find({"institute": given_inst, "position": "PI"}).toArray((e, result) => {
      pi = result
    })
  
  
    // If valid show all users in that institute
    db.collection('users').find({"institute": {$regex: given_inst, $options: "xsi"}}, {"sort": "last_name"}).toArray((e, docs) => {
      var dict = {};
      // Team Stats
      for (i = 0; i < docs.length; i++) {
        var position_str = `${docs[i].position}`
        if (position_str != "PI") {
          position_str = position_str.toLowerCase()
          position_str = position_str[0].toUpperCase() + position_str.slice(1)
          if(dict[`${position_str}`]) {
            dict[`${position_str}`] += 1
          } else {
            dict[`${position_str}`] = 1
          }
        }
      }
  
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