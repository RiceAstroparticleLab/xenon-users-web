var express = require("express");
var router = express.Router();
var ObjectId = require('mongodb').ObjectId; 
var jsdom = require('jsdom');
$ = require('jquery')(new jsdom.JSDOM().window);
var base = '/shifts';

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect(base + '/auth/login');
}

// Set up mailer to send an email to a certain mailing list when new member
// is added 
function NewUserMail(req, mailing_lists, callback) {
  var transporter = req.transporter;
  var message = {
    from: process.env.NOTIFS_ACCOUNT,
    to: process.env.MAILING_LIST,
    subject: 'New Member Confirmation: ' + req.body.FirstName + ' ' + 
      req.body.LastName,
    html: '<p>Hi,</p>' + 
      '<p>A new member has been added by ' + req.user.first_name + ' ' +
        req.user.last_name + ' at ' + req.body.institute + 
        ' that needs access to midway: <br>' +
      'a) Name: ' + req.body.FirstName + ' ' + req.body.LastName + '<br>' +
      'b) email: ' + req.body.Email + '<br>' +
      'c) Position: ' + req.body.position + '<br>' +
      'd) Time: ' + req.body.Time + '%<br>' +
      'e) Tasks: ' + req.body.Tasks + '<br>' +
      'f) Mailing lists: ' + mailing_lists + '<br>' +
      'g) Start date: ' + req.body.StartDate + '<br>' +
      'h) End date: ' + req.body.expectedEnd + '<br>' +
      '<p>Thanks!<br>XENON User Management</p>'
  };
  
  transporter.sendMail(message, function(error, info) {
    if (error) {
      console.log(error);
      callback(false);
    } else {
      console.log('Message sent ' + info.message);
      callback(true);
    }
  });
}

function PendingUserMail(req, mailing_lists, callback) {
  var transporter = req.transporter;
  var message = {
    from: process.env.NOTIFS_ACCOUNT,
    to: process.env.MAILING_LIST,
    subject: 'New Member Request: ' + req.body.FirstName + ' ' + 
      req.body.LastName,
    html: '<p>Hi,</p>' + 
      '<p>A new member has been requested for ' + req.body.institute + ' <br>' +
      'a) Name: ' + req.body.FirstName + ' ' + req.body.LastName + '<br>' +
      'b) email: ' + req.body.Email + '<br>' +
      'c) Position: ' + req.body.position + '<br>' +
      'd) Time: ' + req.body.Time + '%<br>' +
      'e) Tasks: ' + req.body.Tasks + '<br>' +
      'f) Mailing lists: ' + mailing_lists + '<br>' +
      'g) Start date: ' + req.body.StartDate + '<br>' +
      'h) End date: ' + req.body.expectedEnd + '<br>' +
      'Please approve or reject the user at https://xenon1t-daq.lngs.infn.it/shifts/ <br>' +
      '<p>Thank you!<br>XENON User Management</p>'
  };
  
  transporter.sendMail(message, function(error, info) {
    if (error) {
      console.log(error);
      callback(false);
    } else {
      console.log('Message sent ' + info.message);
      callback(true);
    }
  });
}

function ApproveUserMail(req, callback) {
  var transporter = req.transporter;
  var message = {
    from: process.env.NOTIFS_ACCOUNT,
    to: process.env.MAILING_LIST,
    subject: 'Request Approved: ' + req.body.fName + ' ' + 
      req.body.lName,
    html:
      '<p>The following request has been approved by ' + req.user.first_name + ' ' + req.user.last_name + ': </p>' +
      '<p>a) Name: ' + req.body.fName + ' ' + req.body.lName + '<br>' +
      'b) Institute: ' + req.body.institute + '<br>' +
      'c) Position: ' + req.body.position + '<br>' +
      'd) Time: ' + req.body.time + '%<br>' +
      'e) Tasks: ' + req.body.tasks + '<br>' +
      'f) Start date: ' + req.body.start + '<br></p>' +
      '<p>XENON User Management</p>'
  };
  
  transporter.sendMail(message, function(error, info) {
    if (error) {
      console.log(error);
      callback(false);
    } else {
      console.log('Message sent ' + info.message);
      callback(true);
    }
  });
}

function DenyUserMail(req, callback) {
  var transporter = req.transporter;
  var message = {
    from: process.env.NOTIFS_ACCOUNT,
    to: process.env.MAILING_LIST,
    subject: 'Request Denied: ' + req.body.fName + ' ' + 
      req.body.lName,
    html:
      '<p>The following request has been denied by ' + req.user.first_name + ' ' + req.user.last_name + ': </p>' +
      '<p>a) Name: ' + req.body.fName + ' ' + req.body.lName + '<br>' +
      'b) Institute: ' + req.body.institute + '<br></p>' +
      '<p>XENON User Management</p>'
  };
  
  transporter.sendMail(message, function(error, info) {
    if (error) {
      console.log(error);
      callback(false);
    } else {
      console.log('Message sent ' + info.message);
      callback(true);
    }
  });
}

router.post('/updateContactInfo', ensureAuthenticated, function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var idoc = {};
  if (req.body.email != "") {
    idoc['email'] = req.body.email;
    req.user.email = req.body.email;
  }
  if (req.body.skype != "") {
    idoc["skype"] = req.body.skype;
    req.user.skype = req.user.skype;
  }
  if (req.body.cell != "") {	
    idoc["cell"] = req.body.cell;
    req.user.cell = req.body.cell;
  }
  if (req.body.favorite_color != "") {
    idoc["favorite_color"] = req.body.favorite_color;
    req.user.favorite_color = req.body.favorite_color;
  }
  collection.updateOne(
    { 
      "first_name": req.user.first_name,
      "last_name": req.user.last_name
    },
    {"$set": idoc}
  );   
  return(res.redirect(base + '/profile'));
}); 

// Since the button to update a user can be clicked from many different pages, 
// the userid and page parameters in the URL allow us to redirect the user
// to the same page where they clicked the button and also access the mongo
// db using the ObjectId directly
router.post('/:page/:userid/updateContactInfoAdmin', ensureAuthenticated, function(req, res) {
  // Get our form values. These rely on the "name" attributes
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var user_id = new ObjectId(req.params.userid);
  var page = req.params.page;
  var idoc = {};
  idoc['first_name'] = req.body.FirstName;
  idoc['last_name'] = req.body.LastName;
  idoc['email'] = req.body.Email;

  if (req.body.institute != null) {
    idoc['institute'] = req.body.institute;
  }
  if (req.body.position != null) {
    idoc['position'] = req.body.position;
  }
  if (req.body.lngs_id != null) {
    idoc['lngs_ldap_uid'] = req.body.lngs_id;
  }
  if (req.body.Time != "" && req.body.Time != null) {
    idoc['percent_xenon'] = Number(req.body.Time);
  }
  if (req.body.prevTime != null) {
    idoc['previous_time'] = req.body.prevTime;
  }
  if (req.body.addInst != null) {
    idoc['additional_institutes'] = req.body.addInst;
  }
  if (req.body.mlist1 != null || req.body.mlist2 != null || 
     req.body.mlist3 != null) {
    idoc['mailing_lists'] = [
      req.body.mlist1, req.body.mlist2, req.body.mlist3
    ];
  }
  if (req.body.StartDate != "" && req.body.StartDate != null) {
    idoc['start_date'] = new Date(`${req.body.StartDate}`);
  }
  if (req.body.EndDate != "" && req.body.EndDate != null) {
    idoc["end_date"] = new Date(req.body.EndDate);
  }

  collection.findOneAndUpdate({"_id": user_id}, {$set: idoc});
  console.log(`success. Modified ${req.body.FirstName} ${req.body.LastName}`);

  if (page.toString().includes('Institute')) {
    var split = page.toString().split('_')[1];
    page = 'institutes/' + split;
  }
      
  return res.redirect(base + '/' + page)
});

router.post('/adduser', ensureAuthenticated, function(req, res) {
  var db = req.xenonnt_db;
  var idoc = {};
  var mailing_lists = '';

  idoc['first_name'] = req.body.FirstName;
  idoc['last_name'] = req.body.LastName;
  idoc['email'] = req.body.Email;
  idoc['institute'] = req.body.institute;
  idoc['position'] = req.body.position;
  idoc['percent_xenon'] = req.body.Time;
  idoc['mailing_lists'] = [req.body.mlist1, req.body.mlist2, req.body.mlist3];
  if(req.body.StartDate != '') {
    idoc['start_date'] = new Date(req.body.StartDate);
  }

  if (req.body.mlist1 != null) {
    mailing_lists += req.body.mlist1;
    mailing_lists += " ";
  }
  if (req.body.mlist2 != null) {
    mailing_lists += req.body.mlist2;
    mailing_lists += " ";
  }
  if (req.body.mlist3 != null) {
    mailing_lists += req.body.mlist3;
    mailing_lists += " ";
  }    

  try {
    // make sure email alerting of new member can be sent before actually
    // adding the new member to the database
    NewUserMail(req, mailing_lists, function(success){
      if (success) {
        db.collection('users').insertOne(idoc);
        console.log('success. Added' + req.body.FirstName + ' ' +
          req.body.LastName);
        res.redirect(base + '/' + req.body.page);
      } else {
        console.log("error. Could not send email.");
        res.redirect(base + '/' + req.body.page);
      }
    });
  } catch (e) {
    console.log(e);
  }
});

router.post('/pendinguser', function(req, res) {
  var db = req.xenonnt_db;
  var idoc = {};
  var mailing_lists = '';
  var lists = ['xe-all'];

  idoc['pending'] = true;
  idoc['first_name'] = req.body.FirstName;
  idoc['last_name'] = req.body.LastName;
  idoc['email'] = req.body.Email;
  idoc['institute'] = req.body.institute;
  idoc['position'] = req.body.position;
  idoc['percent_xenon'] = req.body.Time;
  if(req.body.StartDate != '') {
    idoc['start_date'] = new Date(req.body.StartDate);
  }

  if (req.body.position === "PhD Student") {
    lists.push('xe-junior');
  }

  $.each($("input[name='mlist']:checked"), function(){
      lists.push($(this).val());
  });

  idoc['mailing_lists'] = lists;

  mailing_lists += lists.join(", ") 

  try {
    // make sure email alerting of new member can be sent before actually
    // adding the new member to the database
    PendingUserMail(req, mailing_lists, function(success){
      if (success) {
        db.collection('users').insertOne(idoc);
        res.redirect(base + '/confirmation');
      } else {
        console.log("error. Could not send email.");
        res.redirect(base + '/request_new_member');
      }
    });
  } catch (e) {
    console.log(e);
  }
});

router.post('/approve_req', function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var id = new ObjectId(req.body.objectId);
  collection
  .findOneAndUpdate({'_id': id}, {$unset: {'pending': ""}})
  .then(() => {
    ApproveUserMail(req, function(success) {
      if(success) {
        res.redirect(base + '/profile');
      } else {
        console.log("error. Could not send email.");
        res.redirect(base + '/profile');
      }
    });
  });
});

router.post('/deny_req', function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var id = new ObjectId(req.body.objectId);

  collection
  .remove({'_id': id})
  .then(() => {
    DenyUserMail(req, function(success) {
      if(success) {
        res.redirect(base + '/profile');
      } else {
        console.log("error. Could not send email.");
        res.redirect(base + '/profile');
      }
    });
  });
});

module.exports = router;