var express = require('express')
var router = express.Router()

const { Octokit } = require("@octokit/rest")

// const { data } = octokit.request("/user");

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect('/auth/login');
}

router.get('/', ensureAuthenticated, function(req, res) {
  db = req.test_db
  var remove = []
  var add_db = []
  db.collection('github_users').find({}).forEach((doc) => {
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
    console.log(regex)
    // console.log(name_arr)
    // users have an end date but are in the github
      
      db.collection('users').find(
        { first_name: {$in: name_arr},
          last_name: {$in: name_arr},
          end_date: {$exists: true}}).toArray((e, docs) => {
            if(docs.length > 0) {
              // console.log(docs)
              remove.push(docs)
            }
      })

      var name = name_arr
      var git = doc.github
      db.collection('users').find({ 
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
  }).then(() => {
    console.log(remove)
    console.log(add_db)
    var customTimeout = 2000;

    res.setTimeout(customTimeout, function(){
      console.log("TIMED!");
      res.render('admin', {page:'Admin Dashboard', menuId:'home', 'remove': remove, 'add_db': add_db, user: req.user}) //'data': names_arr
    });

  })

})

router.post('/github_xenon1t', ensureAuthenticated, function(req, res) {
  console.log(req.user.token)
  const octokit = new Octokit({
    auth: req.user.token,
  });

  // var auth_user = octokit.users.getAuthenticated()
  
  db = req.test_db
  async function getUsernames() {
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

  async function getUsers() {
    try {
      var values = await getUsernames()
    } catch (e) {
      console.log(e)
    }
  
    // console.log(values)

    /* update the database/add new logins */
    for (i = 0; i < values.length; i++) {
      users = values[i].data
      for (j = 0; j < users.length; j++) {
        await db.collection('github_users').updateOne(
          { "github": users[j].login }, 
          { $set: {"github": users[j].login,
            "xenon1t": true} }, 
          { upsert: true }
        )
      }
    }

    /* get and store the usernames */
    let promises = []
    for (i = 0; i < values.length; i++) {
      users = values[i].data
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
        db.collection('github_users').updateOne(
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

  // async function main() {
  //   try {
  //     var names_arr = await listUsers()
  //   } catch (e) {
  //     console.log(e)
  //   }
  //   console.log(names_arr)
  //   res.render('admin', {page:'Admin Dashboard', menuId:'home', 'data': names_arr, user: req.user})
  // }

  // main()
  listUsers()
})

module.exports = router