var express = require('express')
var router = express.Router()
var base = '/shifts'

const { Octokit } = require("@octokit/rest")

// In order for all the commands to work, the person with the personal access 
// token needs to be an organization owner and have all the other correct permissions
const TOKEN = process.env.PERSONAL_ACCESS_TOKEN
const octokit = new Octokit({
    auth: TOKEN,
    baseUrl: "https://api.github.com",
  });

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect(base + '/auth/login');
}

router.get('/', ensureAuthenticated, function(req, res) {
  var db = req.recode_db
  db.collection('admin').find({'roles_list': {$exists: true}}).toArray(function(e, docs) {
    var roles = docs[0].roles_list
    var dbx = req.xenonnt_db
    dbx.collection('users').find({"groups": {$exists: true}}).toArray(function(e, docs) {
      res.render('admin', {page:'Admin Dashboard',
                           menuId:'home',
                           'roles': roles,
                           'users': docs,
                           user: req.user}) 
    })
  })
})

router.post('/add_role', ensureAuthenticated, function(req, res) {
  var db = req.recode_db;
  var new_role = req.body.role
  db.collection('admin').findOneAndUpdate({'roles_list': {$exists: true}}, {$push: {'roles_list': new_role}})
})

router.get('/get_roles', ensureAuthenticated, function(req, res) {
  var db = req.recode_db;
  db.collection('admin').find({'roles_list': {$exists: true}}).toArray(function(e, docs) {
    res.send(docs)
  })
})

router.get('/add_to_db', ensureAuthenticated, function(req,res) {
  var db = req.recode_db;
  var dbx = req.xenonnt_db
  var add_db = [];
  db.collection('admin').find({}).forEach((doc) => {
    var name_arr = []
    var regex = []
    if(doc.first_name != null) {
      name_arr = doc.first_name.split(/\s+/g)
      for (idx = 0; idx < name_arr.length; idx++) {
        var pattern = name_arr[idx];
        var reg = new RegExp(pattern)
        regex.push(reg)
      }
    }

    var name = name_arr
    var git = doc.github
    dbx.collection('users').find({ 
      $or: [
        { $and: [{ first_name: {$in: regex}, last_name: {$in: name_arr}}] },
        { $and: [{ first_name: {$in: name_arr}, last_name: {$in: regex}}] },
        { github: doc.github }
      ]
    }).toArray((e, docs) => {
          if(docs.length < 1) {
            console.log(docs)
            console.log(name + "" + git)
            if (name.length != 0) {
              add_db.push(name)
            } else {
              add_db.push(git)
            }
          }
    })
  }).then(() =>  res.send(add_db)) // does not wait for whole array
})

router.get('/gitremove_xenon1t', ensureAuthenticated, function(req, res) {
  var db = req.recode_db;
  var dbx = req.xenonnt_db
  var remove = []
  db.collection('admin').find({}).forEach((doc) => {
    var name_arr
    var regex = []
    if(doc.first_name != null) {
      name_arr = doc.first_name.split(/\s+/g)
      for (idx = 0; idx < name_arr.length; idx++) {
        var pattern = name_arr[idx];
        var reg = new RegExp(pattern)
        regex.push(reg)
      }
    } else {
      name_arr = []
      regex = []
    }
    // console.log(name_arr)
    // users have an end date but are in the github
    
    dbx.collection('users').find(
      { first_name: {$in: name_arr},
        last_name: {$in: name_arr},
        end_date: {$exists: true}}).toArray((e, docs) => {
          if(docs.length > 0) {
            // console.log(docs)
            remove.push(docs)
          }
        
    })
  }).then(() => {
    res.send(remove)
  })
})

router.post('/get_github', ensureAuthenticated, function(req, res) {
  var db = req.recode_db
  async function getXenon1tUsernames() {
    let page1 = octokit.orgs.listMembers({
      org: "XENON1T",
      per_page: 100,
    })
    
    let page2 = octokit.orgs.listMembers({
      org: "XENON1T",
      per_page: 100,
      page: 2,
    })
    
    try {
      var xenon1t = await Promise.all([page1, page2])
    } catch (e) {
      console.log(e)
    }

    return xenon1t
  }

  async function getXenonntUsernames() {
    let page1 = octokit.orgs.listMembers({
      org: "XENONnT",
      per_page: 100,
    })
    
    let page2 = octokit.orgs.listMembers({
      org: "XENONnT",
      per_page: 100,
      page: 2,
    })
    
    try {
      var xenonnt = await Promise.all([page1, page2])
    } catch (e) {
      console.log(e)
    }

    return xenonnt
  }

  async function getUsers() {
    try {
      var xenon1t = await getXenon1tUsernames()
      var xenonnt = await getXenonntUsernames()
    } catch (e) {
      console.log(e)
    }
  
    // console.log(values)

    /* update the database/add new logins */
    for (i = 0; i < xenon1t.length; i++) {
      users = xenon1t[i].data
      for (j = 0; j < users.length; j++) {
        await db.collection('admin').updateOne(
          { "github": users[j].login }, 
          { $set: {"github": users[j].login,
            "xenon1t": true} }, 
          { upsert: true }
        )
      }
    }
    for (i = 0; i < xenonnt.length; i++) {
      users = xenonnt[i].data
      for (j = 0; j < users.length; j++) {
        await db.collection('admin').updateOne(
          { "github": users[j].login }, 
          { $set: {"github": users[j].login,
            "xenon1t": true} }, 
          { upsert: true }
        )
      }
    }

    /* get and store the usernames */
    let promises = []
    for (i = 0; i < xenon1t.length; i++) {
      users = xenon1t[i].data
      for (j = 0; j < users.length; j++) {
        promises.push(octokit.users.getByUsername({username: users[j].login,}))
      }
    }
    for (i = 0; i < xenonnt.length; i++) {
      users = xenonnt[i].data
      for (j = 0; j < users.length; j++) {
        promises.push(octokit.users.getByUsername({username: users[j].login,}))
      }
    }
    
    try {
      var resolvedPromises = await Promise.all(promises)
    } catch (e) {
      console.log(e)
    }
    return resolvedPromises
  }
  
  async function listUsers() {
    //let names = []
    try {
      var val = await getUsers()

      for (i = 0; i < val.length; i++) {
        
        /* update the db with the name of each user */
        db.collection('admin').updateOne(
          {"github": val[i].data.login}, 
          { $set: {"first_name": val[i].data.name}})
        // names.push(val[i].data.name)
      }
    } catch (e) {
      console.log(e)
    }

    // console.log(names)
    //return names
  }

  listUsers()
})

module.exports = router