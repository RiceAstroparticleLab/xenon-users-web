var express = require("express");
var router = express.Router();
var ObjectId = require('mongodb').ObjectId; 
var jsdom = require('jsdom');
var moment = require('moment');
$ = require('jquery')(new jsdom.JSDOM().window);
var base = '/shifts';

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.session.returnTo = req.originalUrl;
  return res.redirect(base + '/auth/login');
}

// Set up mailer to send an email to a certain mailing list when new member
// is added 
function NewUserMail(req, mailing_lists, callback) {
  var transporter = req.transporter;
  var message = {
    from: process.env.NOTIFS_ACCOUNT,
    to: process.env.CB_EMAIL,
    cc: [process.env.CHRIS_EMAIL, process.env.YVETTE_EMAIL],
    subject: 'New Member Confirmation: ' + req.body.FirstName + ' ' + 
      req.body.LastName,
    html: '<p>Dear Collaboration Board,</p>' + 
      '<p>A new member has been added by ' + req.user.first_name + ' ' +
        req.user.last_name + ' at ' + req.body.institute + '</p>' +
      '<p>a) Name: ' + req.body.FirstName + ' ' + req.body.LastName + '<br>' +
      'b) email: ' + req.body.Email + '<br>' +
      'c) Position: ' + req.body.position + '<br>' +
      'd) Time: ' + req.body.Time + '%<br>' +
      'e) Tasks: ' + req.body.Tasks + '<br>' +
      'f) Mailing lists: ' + mailing_lists + '<br>' +
      'g) Start date: ' + req.body.StartDate + '<br>' +
      'h) End date: ' + req.body.expectedEnd + '</p>' +
      '<p>Regards,<br>XENON User Management System</p>'
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
    to: process.env.CB_EMAIL,
    cc: [process.env.ZE_EMAIL, process.env.CHRIS_EMAIL, process.env.YVETTE_EMAIL],
    subject: 'New Member Request: ' + req.body.FirstName + ' ' + 
      req.body.LastName,
    html: '<p>Dear Collaboration Board,</p>' + 
      `<p>Please review the new membership request that was made by ${req.user.first_name} ${req.user.last_name}. The information is as follows: </p>` +
      '<p>a) Name: ' + req.body.FirstName + ' ' + req.body.LastName + '<br>' +
      'b) Email: ' + req.body.Email + '<br>' +
      'c) Position: ' + req.body.position + '<br>' +
      'd) Time: ' + req.body.Time + '%<br>' +
      'e) Tasks: ' + req.body.Tasks + '<br>' +
      'f) Mailing lists: ' + mailing_lists + '<br>' +
      'g) Start date: ' + req.body.StartDate + '<br>' +
      'h) End date: ' + req.body.expectedEnd + '</p>' +
      '<p>Collaboration board: Please reply to all in this email thread if you would ' +
        'like a discussion in CB or more information on this member proposal. If you agree with the new member, do nothing. ' +
        'For instructions on how to use this system to submit your own members or other user management' +
        ' tasks, please see https://xe1t-wiki.lngs.infn.it/doku.php?id=xenon:xenonnt:userlist_management.' +
        'To submit your own request, please visit https://xenonnt.lngs.infn.it/shifts/request_new_member.<br><br>' +
      'Our members admin (Ze) will approve or reject the new member after discussion or no request for information.</p>' + 
      '<p>Regards,<br>XENON User Management System</p>'
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
    to: process.env.ADMIN_EMAIL,
    cc: [process.env.CB_EMAIL, process.env.CHRIS_EMAIL, process.env.YVETTE_EMAIL],
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
    to: process.env.CB_EMAIL,
    cc: [process.env.ADMIN_EMAIL, process.env.CHRIS_EMAIL, process.env.YVETTE_EMAIL],
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

function UpdateUserMail(req, changes, previously, callback) {
  var transporter = req.transporter;
  var message = {
    from: process.env.NOTIFS_ACCOUNT,
    to: process.env.CB_EMAIL,
    cc: [process.env.CHRIS_EMAIL, process.env.YVETTE_EMAIL],
    subject: 'User Information Updated: ' + req.body.FirstName + ' ' + 
      req.body.LastName,
    html: '<p>Dear all,</p>' + 
      "<p>" + req.body.FirstName + ' ' + req.body.LastName +"'s information has been updated by " + req.user.first_name + ' ' +
        req.user.last_name + ' at ' + req.body.institute + '. Please review the following changes:</p>' +
      '<p>' + changes + '</p>' +
      `<p>Previously, the information was as follows: </p><p>${previously}</p>` +
      '<p>Regards,<br>XENON User Management System</p>'
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

function LeaveCollaborationMail(req, callback) {
  var transporter = req.transporter;
  var message = {
    from: process.env.NOTIFS_ACCOUNT,
    to: process.env.CB_EMAIL,
    cc: [process.env.CHRIS_EMAIL, process.env.YVETTE_EMAIL],
    subject: `${req.body.name} left the collaboration.`,
    html: '<p>Dear all,</p>' + 
      `<p>${req.user.first_name} ${req.user.last_name} is removing ${req.body.name}. ` + 
      'Please review the following information:</p>' +
      `<p>a) Name: ${req.body.name}<br>` +
      `b) Email: ${req.body.email}<br>` +
      `c) Position: ${req.body.position}<br>` +
      `d) Institute: ${req.body.institute}<br>` +
      `d) Time: ${req.body.time}%<br>` +
      `g) Start date: ${req.body.sdate}<br>` +
      `h) End date: ${req.body.edate}</p>` +
      '<p>Regards,<br>XENON User Management System</p>'
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
  if (req.body.git != "") {
    idoc['github'] = req.body.git;
    req.user.github = req.body.git;
  }
  if (req.body.lngs != "") {
    idoc['lngs_ldap_uid'] = req.body.lngs;
    req.user.lngs_ldap_uid = req.body.lngs;
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
  var idoc = {}; // changes made to mongo
  var previous_doc; // previous member info
  var changes = ""; // html for changes made to the member for email
  var previously = ""; // html to keep track of previous member info in email

  collection.find({"_id": user_id}).toArray(function(e, data) {
    console.log(data)
    previous_doc = data[0];
    
    if (req.body.mlist != null && Array.isArray(req.body.mlist)) {
      var lists = req.body.mlist;
    } else {
      if (req.body.mlist != null) {
        var lists = [req.body.mlist]
      } else {
        var lists = []
      }
    }
    console.log(lists);
    lists.push('xe-all');

    idoc['first_name'] = req.body.FirstName;
    if (idoc['first_name'] != previous_doc['first_name']) {
      previously += 'First Name: ' + previous_doc['first_name'] + '<br>';
      changes += 'First Name: ' + req.body.FirstName + '<br>';
    }
    idoc['last_name'] = req.body.LastName;
    if (idoc['last_name'] != previous_doc['last_name']) {
      previously += 'Last Name: ' + previous_doc['last_name'] + '<br>';
      changes += 'Last Name: ' + req.body.LastName + '<br>';
    }
    idoc['email'] = req.body.Email;
    idoc['mailing_lists'] = lists;

    if (req.body.institute != null) {
      idoc['institute'] = req.body.institute;
      if (idoc['institute'] != previous_doc['institute']) {
        changes += 'Institute: ' + req.body.institute + '<br>';
        prevtimestr = req.body.prevTime + "Was at " + previous_doc['institute'] + " until " + moment().format("MMM YYYY") + ". ";
        idoc['previous_time'] = prevtimestr;
        previously += 'Previous Time: ' + previous_doc['institute'] + '<br>';
        changes += 'Previous Time: ' + prevtimestr + '<br>';
      } else {
        if (req.body.prevTime != null && req.body.prevTime != "") {
          idoc['previous_time'] = req.body.prevTime;
        }
      }
    }
    if (req.body.position != null) {
      idoc['position'] = req.body.position;
      if (idoc['position'] != previous_doc['position']) {
        previously += 'Position: ' + previous_doc['position'] + '<br>';
        changes += 'Position: ' + req.body.position + '<br>';
      }
    }
    if (req.body.lngs_id != null && req.body.lngs_id != "") {
      idoc['lngs_ldap_uid'] = req.body.lngs_id;
    }
    if (req.body.Time != "" && req.body.Time != null) {
      idoc['percent_xenon'] = Number(req.body.Time);
      if (idoc['percent_xenon'] != previous_doc['percent_xenon']) {
        previously += 'Percent XENON: ' + previous_doc['percent_xenon'] + '<br>';
        changes += 'Percent XENON: ' + Number(req.body.Time) + '<br>';
      }
    }

    if (req.body.addInst != null && req.body.addInst != "") {
      idoc['additional_institutes'] = req.body.addInst;
    }
    if (req.body.StartDate != "" && req.body.StartDate != null) {
      idoc['start_date'] = new Date(`${req.body.StartDate}`);
    }
    if (req.body.EndDate != "" && req.body.EndDate != null) {
      idoc['end_date'] = new Date(req.body.EndDate);
    }
    idoc['last_modified'] = new Date();

    // fixes redirect in case forms are on different pages
    if (page.toString().includes('Institute')) {
      var split = page.toString().split('_')[1];
      page = 'institutes/' + split;
    }

    if (changes !== "") {
      try {
        // make sure email alerting of new member can be sent before actually
        // adding the new member to the database
        UpdateUserMail(req, changes, previously, function(success){
          if (success) {
            collection.findOneAndUpdate({"_id": user_id}, {$set: idoc});
            console.log(`success. Modified ${req.body.FirstName} ${req.body.LastName}`);
            res.redirect(base + '/' + page);
          } else {
            console.log("error. Could not send email.");
            res.redirect(base + '/' + page);
          }
        });
      } catch (e) {
        console.log(e);
      }
    } else {
      collection.findOneAndUpdate({"_id": user_id}, {$set: idoc});
      console.log(`success. Modified ${req.body.FirstName} ${req.body.LastName}`);
      res.redirect(base + '/' + page);
    }
  });
});

router.post('/adduser', ensureAuthenticated, function(req, res) {
  var db = req.xenonnt_db;
  var idoc = {};
  var mailing_lists = '';
  if (req.body.mlist != null && Array.isArray(req.body.mlist)) {
    var lists = req.body.mlist;
  } else {
    if (req.body.mlist != null) {
      var lists = [req.body.mlist]
    } else {
      var lists = []
    }
  }
  console.log(lists);
  lists.push('xe-all');
  mailing_lists += lists.join(", ")

  idoc['first_name'] = req.body.FirstName;
  idoc['last_name'] = req.body.LastName;
  idoc['email'] = req.body.Email;
  idoc['institute'] = req.body.institute;
  idoc['position'] = req.body.position;
  idoc['percent_xenon'] = req.body.Time;
  idoc['mailing_lists'] = lists;
  idoc['active'] = "true";
  if(req.body.StartDate != '') {
    idoc['start_date'] = new Date(req.body.StartDate);
  }  

  try {
    // make sure email alerting of new member can be sent before actually
    // adding the new member to the database
    NewUserMail(req, mailing_lists, function(success){
      if (success) {
        db.collection('users').insertOne(idoc);
        console.log('success. Added' + req.body.FirstName + ' ' +
          req.body.LastName);
        res.redirect(base + '/fulldirectory');
      } else {
        console.log("error. Could not send email.");
        res.redirect(base + '/fulldirectory');
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
  if (req.body.mlist != null && Array.isArray(req.body.mlist)) {
    var lists = req.body.mlist;
  } else {
    if (req.body.mlist != null) {
      var lists = [req.body.mlist]
    } else {
      var lists = []
    }
  }
  console.log(lists);
  lists.push('xe-all');
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
  if (req.body.expectedEnd != "" && req.body.expectedEnd != null) {
    idoc['end_date'] = new Date(req.body.expectedEnd);
  }

  if (req.body.position === "PhD Student") {
    lists.push('xe-junior');
  }
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
  .findOneAndUpdate({'_id': id}, {$set: {"active": "true"}, $unset: {'pending': ""}})
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

router.post('/removeuser', function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var user_id = new ObjectId(req.body.selectedUser);

  try {
    // make sure email alerting of new member can be sent before actually
    // adding the new member to the database
    LeaveCollaborationMail(req, function(success){
      if (success) {
        collection.findOneAndUpdate(
          {"_id": user_id}, 
          {$set: {email: req.body.email, active: "false", end_date: new Date(req.body.edate), last_modified: new Date()}}
        );
        console.log(`success. Modified ${req.body.selectedUser}`);
        res.redirect(base + '/remove_member');
      } else {
        console.log("error. Could not send email.");
        res.redirect(base + '/remove_member');
      }
    });
  } catch (e) {
    console.log(e);
  }
});

function LinkLNGSMail(req, callback) {
  var transporter = req.transporter;
  var message = {
    from: process.env.NOTIFS_ACCOUNT,
    to: req.body.email,
    cc: [process.env.CHRIS_EMAIL, process.env.YVETTE_EMAIL],
    subject: `You have successfully linked your LNGS account.`,
    html:
      `<p>Your LNGS account was succesfully linked on the Shift Management website. You ` +
      `are now free to log in with your LNGS credentials to the Shift and DAQ websites.</p>` +
      `<p>If you did not make this change please report it immediately.</p>` +
      '<p>Regards,<br>XENON User Management System</p>'
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

router.post('/linkuser', function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var user_id = new ObjectId(req.body.selectedUser);

  try {
    // make sure email alerting of new member can be sent before actually
    // adding the new member to the database
    LinkLNGSMail(req, function(success){
      if (success) {
        collection.findOneAndUpdate(
          {"_id": user_id}, 
          {$set: {lngs_ldap_uid: req.body.lngs_id}}
        );
        console.log(`success. Modified ${req.body.selectedUser}`);
        res.redirect(base + '/auth/login');
      } else {
        console.log("error. Could not send email.");
        res.redirect(base + '/auth/login');
      }
    });
  } catch (e) {
    console.log(e);
  }
})
module.exports = router;