var express = require("express")
var router = express.Router()

/* GET Institutes List page. */
router.get('/', function(req, res) {
    var db = req.recode_db
    db.collection('users').distinct("institute", (e, docs) => {
      res.render('institutes', {page:'Home', menuId:'home', "data": docs});
    })
  })

/* GET individual institution page. */
router.get('/:institute', function(req, res) {
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
    db.collection('users').find({"institute": given_inst}, {"sort": "last_name"}).toArray((e, docs) => {
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
  
      res.render('institute_stats', {page: `${ given_inst }`, 
        menuId: 'home', 
        "PI": pi,
        "dict": dict,
        "data": docs})
    })
  
  })

  module.exports = router