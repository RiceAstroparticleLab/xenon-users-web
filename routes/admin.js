var express = require('express');
var router = express.Router();
var base = '/shifts';

/* Set up GitHub REST API client for Node.js */
const { Octokit } = require("@octokit/rest");
// In order for all the commands to work, the person with the personal access 
// token needs to be an organization owner and have all the other correct 
// scopes (admin:org, user)
const TOKEN = process.env.PERSONAL_ACCESS_TOKEN;
const octokit = new Octokit({
    auth: TOKEN,
    baseUrl: "https://api.github.com",
  });

/* Set up LDAP API for Node.js */
var ldap = require('ldapjs');
var server = ldap.createServer();

// everything except login on this website requires the user to be logged in
// otherwise the user gets redirected to the login page
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect(base + '/auth/login');
}

// havent figured a better way to make sure that all mongodb queries get
// to finish in a forEach because they run async to eachother
function waitOnInternalQuery(res, info) {
  setTimeout(function (){ res.send(info);}, 6000);
}

router.get('/', ensureAuthenticated, function(req, res) {
  var db = req.recode_db;
  var dbx = req.xenonnt_db;
  var admin = db.collection('admin');
  var users = dbx.collection('users');
  admin.find({'roles_list': {$exists: true}}).toArray(function(e, docs) {
    var roles = docs[0].roles_list;
    var date;
    admin.find({'page': 'github'}).toArray(function(e, doc) {
      date = doc[0].last_synced;
    });
    users.find({"groups": {$exists: true}}).toArray(function(e, doc) {
      res.render('admin', {page:'Admin Dashboard',
                           menuId:'home',
                           'roles': roles,
                           'users': doc,
                           'last_synced': date,
                           user: req.user});
    });
  });
});

// adds a role to the roles list in mongodb collection
router.post('/add_role', ensureAuthenticated, function(req, res) {
  var db = req.recode_db;
  var newRole = req.body.role;
  var collection = db.collection('admin');
  collection.findOneAndUpdate(
    {'roles_list': {$exists: true}},
    {$push: {'roles_list': newRole}}
  );
  return res.redirect(base + '/admin');
})

// retrieves the document that holds the user roles in the db
router.get('/get_roles', ensureAuthenticated, function(req, res) {
  var db = req.recode_db;
  var dbx = req.xenonnt_db;
  var admin = db.collection('admin');
  var users = dbx.collection('users');
  users.find({'groups': {$exists: true}}).toArray(function(e, docs) {
    admin.find({'roles_list': {$exists: true}}).toArray(function(e, doc) {
      docs.push(doc[0])
      res.send(docs)    
    });  
  }); 
})

// checks which users are either in the XENON1T or XENONnT organizations on 
// github but are not in the mongo database
router.get('/add_to_db', ensureAuthenticated, function(req,res) {
  var db = req.recode_db;
  var dbx = req.xenonnt_db;
  var addToDb = [];
  var admin = db.collection('admin');
  var users = dbx.collection('users');
  // get and iterate through all members of XENON1T and XENONnT on GitHub
  admin.find({}).forEach(function(doc) {
    let nameArr = [];
    let regex = [];
    if(doc.first_name != null) {
      nameArr = doc.first_name.split(/\s+/g)
      for (let idx = 0; idx < nameArr.length; idx++) {
        let pattern = nameArr[idx];
        let reg = new RegExp(pattern);
        regex.push(reg);
      }
    }

    // look for users in that match db that match the names in GitHub
    let name = nameArr; 
    users.find(
      {$or: [
        {$and: [{first_name: {$in: regex}, last_name: {$in: nameArr}}]},
        {$and: [{first_name: {$in: nameArr}, last_name: {$in: regex}}]},
        {github: doc.github}
      ]}
    ).toArray(function(e, docs) {
      // if a user is not found, get that name and display it
      if(docs.length < 1 && name.length !== 0) {
        addToDb.push(name);
      }
    });
  }).then(waitOnInternalQuery(res, addToDb));
});

// checks which users are in the XENON1T organization on github but have an 
// end date in the mongo data base
router.get('/gitremove_xenon1t', ensureAuthenticated, function(req, res) {
  var db = req.recode_db;
  var dbx = req.xenonnt_db;
  var admin = db.collection('admin');
  var users = dbx.collection('users');
  var remove = [];
  // find all users who are in xenon1t github
  admin.find({'xenon1t': true}).forEach(function(doc) {
    let nameArr;
    let regex = [];
    if(doc.first_name != null) {
      nameArr = doc.first_name.split(/\s+/g);
      for (let idx = 0; idx < nameArr.length; idx++) {
        let pattern = nameArr[idx];
        let reg = new RegExp(pattern);
        regex.push(reg);
      }
    } else {
      nameArr = [];
      regex = [];
    }

    // check user has an end date but are in the github
    users.find(
      { first_name: {$in: nameArr},
        last_name: {$in: nameArr},
        end_date: {$exists: true} }
    ).toArray(function(e, docs) {
      if(docs.length > 0) {
        remove.push(docs);
      }
    });
  }).then(waitOnInternalQuery(res, remove));
});

// checks which users are in the XENONnT organization on github but have an 
// end date in the mongo database
router.get('/gitremove_xenonnt', ensureAuthenticated, function(req, res) {
  var db = req.recode_db;
  var dbx = req.xenonnt_db;
  var admin = db.collection('admin');
  var users = dbx.collection('users');
  var remove = [];
  // list users in xenonnt github org
  admin.find({'xenonnt': true}).forEach(function(doc) {
    let nameArr;
    let regex = [];
    if(doc.first_name != null) {
      nameArr = doc.first_name.split(/\s+/g);
      for (let idx = 0; idx < nameArr.length; idx++) {
        var pattern = nameArr[idx];
        var reg = new RegExp(pattern);
        regex.push(reg);
      }
    } else {
      nameArr = [];
      regex = [];
    }
    // users have an end date but are in the github
    users.find(
      { first_name: {$in: nameArr},
        last_name: {$in: nameArr},
        end_date: {$exists: true} }
    ).toArray((e, docs) => {
      if(docs.length > 0) {
        remove.push(docs);
      }
    });
  }).then(waitOnInternalQuery(res, remove));
});

/* FIX THIS FUNCTION */
// checks which users are in the database but are not found in the XENON1T
// github organization 
router.get('/gitadd_xenon1t', ensureAuthenticated, function(req,res) {
  db = req.recode_db;
  dbx = req.xenonnt_db;
  var admin = db.collection('admin');
  var users = dbx.collection('users');
  var add = [];
  users.find({end_date: {$exists: false}}).forEach((doc) => {
    var name = doc.first_name + ' ' + doc.last_name;
    var regex = new RegExp(name);

    var missing = doc;
    admin.find({
      first_name: regex,
      xenon1t: {$exists: true}}
    ).toArray((e, docs) => {
      console.log("github: " + doc.github + " match: ")
      console.log(docs)
      if (docs.length < 1) {
        console.log("missing:" + missing);
        add.push(missing);
      }
    });
  }).then(waitOnInternalQuery(res, add));
});

/* FIX THIS FUNCTION */
// checks which users are in the database but are not found in the XENONnT
// github organization 
router.get('/gitadd_xenonnt', ensureAuthenticated, function(req,res) {
  db = req.recode_db;
  dbx = req.xenonnt_db;
  var admin = db.collection('admin');
  var users = dbx.collection('users');
  var add = [];
  users.find({end_date: {$exists: false}}).forEach((doc) => {
    var name = doc.first_name + ' ' + doc.last_name;
    var regex = new RegExp(name);

    var missing = doc;
    admin.find({
      first_name: regex,
      xenonnt: {$exists: true}}
    ).toArray((e, docs) => {
      console.log("github: " + doc.github + " match: ")
      console.log(docs)
      if (docs.length < 1) {
        console.log("missing:" + missing);
        add.push(missing);
      }
    });
  }).then(waitOnInternalQuery(res, add));
});

/* FIX THIS! doesnt check for when people are removed from github org */
// pulls member data from xenonnt and xenon1t and updates the db 
router.post('/get_github', ensureAuthenticated, function(req, res) {
  var db = req.recode_db;
  var admin = db.collection('admin');
  async function getXenon1tUsernames() {
    // maybe paginate would be better? 
    var page1 = octokit.orgs.listMembers({
      org: "XENON1T",
      per_page: 100,
    });
    var page2 = octokit.orgs.listMembers({
      org: "XENON1T",
      per_page: 100,
      page: 2,
    });
    
    try {
      var xenon1t = await Promise.all([page1, page2]);
    } catch (e) {
      console.log(e);
    }
    return xenon1t;
  }

  async function getXenonntUsernames() {
    // again. paginate?
    var page1 = octokit.orgs.listMembers({
      org: "XENONnT",
      per_page: 100,
    });
    var page2 = octokit.orgs.listMembers({
      org: "XENONnT",
      per_page: 100,
      page: 2,
    });
    
    try {
      var xenonnt = await Promise.all([page1, page2]);
    } catch (e) {
      console.log(e);
    }
    return xenonnt
  }

  async function getUsers() {
    try {
      var xenon1t = await getXenon1tUsernames();
      var xenonnt = await getXenonntUsernames();
    } catch (e) {
      console.log(e);
    }
  
    // update the database/add new logins
    for (let i = 0; i < xenon1t.length; i++) {
      let users = xenon1t[i].data;
      for (let j = 0; j < users.length; j++) {
        await admin.updateOne(
          {"github": users[j].login}, 
          {$set: {"github": users[j].login, "xenon1t": true}}, 
          {upsert: true}
        );
      }
    }
    for (let i = 0; i < xenonnt.length; i++) {
      let users = xenonnt[i].data;
      for (let j = 0; j < users.length; j++) {
        await admin.updateOne(
          {"github": users[j].login}, 
          {$set: {"github": users[j].login, "xenonnt": true}}, 
          {upsert: true}
        );
      }
    }

    // get and store the usernames
    var promises = [];
    for (let i = 0; i < xenon1t.length; i++) {
      let users = xenon1t[i].data;
      for (let j = 0; j < users.length; j++) {
        promises.push(
          octokit.users.getByUsername({username: users[j].login})
        );
      }
    }
    for (let i = 0; i < xenonnt.length; i++) {
      let users = xenonnt[i].data;
      for (let j = 0; j < users.length; j++) {
        promises.push(
          octokit.users.getByUsername({username: users[j].login})
        );
      }
    }
    
    try {
      var resolvedPromises = await Promise.all(promises);
    } catch (e) {
      console.log(e);
    }
    return resolvedPromises;
  }
  
  async function listUsers() {
    try {
      var val = await getUsers();
      for (let i = 0; i < val.length; i++) {
        // update the db with the name of each user
        admin.updateOne(
          {"github": val[i].data.login}, 
          { $set: {"first_name": val[i].data.name}}
        );
        
        // update the 'last synced' time because button was clicked
        admin.updateOne(
          {"page": "github"},
          {$set: {"last_synced": new Date()}},
          {upsert: true}
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

  listUsers().then(
    res.redirect(base+ '/admin')
  );
});

module.exports = router