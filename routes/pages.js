var express = require('express')
var router = express.Router()

// /* GET home page. */
// router.get('/', function(req, res, next) {
//     res.render('landing', { title: 'Under Construction' })
//   })

/* GET home page. */
router.get('/', function(req, res, next) {
  var db = req.run_db
  db.collection('users').distinct("institute", (e, docs) => {
    res.render('landing', {page:'Home', menuId:'home', "data": docs});
  })
})

/* GET Userlist page. */
router.get('/fulldirectory', function(req, res) {
  var db = req.run_db
  db.collection('users').find({}, {"sort": "last_name"}).toArray((e,docs) => {
      res.render('fulldirectory', {page: 'Full Directory', menuId: 'home', "data": docs})
  })
})

/* GET individual institution page. */
router.get('/institutes/:institute', function(req, res) {
  var db = req.run_db
  var given_inst = req.params.institute
  console.log(`Institute: ${given_inst}`)
  //Look up institution if not a valid institute, send error

  // Stats for this institute
  var pi
  db.collection('users').find({"institute": given_inst, "position": "PI"}).toArray((e, result) => {
    pi = result
  })
  var phd_students
  db.collection('users').find({"institute": given_inst, "position": "PhD Student" || "Phd Student"}).toArray((e, result) => {
    phd_students = result
  })
  var master_students
  db.collection('users').find({"institute": given_inst, "position": "Master student"}).toArray((e, result) => {
    master_students = result
  })
  var post_doc
  db.collection('users').find({"institute": given_inst, "position": "Postdoc"}).toArray((e, result) => {
    post_doc = result
  })
  var thesis_students
  db.collection('users').find({"institute": given_inst, "position": "Thesis student"}).toArray((e, result) => {
    thesis_students = result
  })
  var other_student
  db.collection('users').find({"institute": given_inst, "position": "Other student"}).toArray((e, result) => {
    other_student = result
  })
  var staff
  db.collection('users').find({"institute": given_inst, "position": "Staff"}).toArray((e, result) => {
    staff = result
  })
 

  //If valid show all users in that institute
  db.collection('users').find({"institute": given_inst}, {"sort": "last_name"}).toArray((e, docs) => {
    res.render('institutes', {page: `${ given_inst }`, 
      menuId: 'home', 
      "PI": pi,
      "PhD": phd_students,
      "Master": master_students,
      "PD": post_doc,
      "Thesis": thesis_students,
      "Other": other_student,
      "Staff": staff,
      "data": docs})
  })

})

module.exports = router