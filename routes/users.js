var express = require("express")
var router = express.Router()
var ObjectId = require('mongodb').ObjectId; 
var base = '/shifts'

// authentication
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    return res.redirect(base + '/auth/login');
}

router.post('/updateContactInfo', ensureAuthenticated, (req, res) => {
    var db = req.recode_db;
    var idoc = {};
    if(req.body.email != ""){
        idoc['email'] = req.body.email;
        req.user.email = req.body.email;
    }
    if(req.body.skype != ""){
        idoc["skype"] = req.body.skype;
	    req.user.skype = req.user.skype;
    }
    if(req.body.cell != ""){	
        idoc["cell"] = req.body.cell;
	    req.user.cell = req.body.cell;
    }
    if(req.body.favorite_color != ""){
        idoc["favorite_color"] = req.body.favorite_color;
	    req.user.favorite_color = req.body.favorite_color;
    }
    db.collection('users').updateOne({"first_name": req.user.first_name,
		       "last_name": req.user.last_name},
		      {"$set": idoc});
    // console.log(req.user);
    // console.log(idoc);    
    return(res.redirect(base + '/profile'));
}); 

router.post('/:page/:userid/updateContactInfoAdmin', ensureAuthenticated, (req, res) => {
    // Get our form values. These rely on the "name" attributes
    var db = req.recode_db
    var user_id = new ObjectId(req.params.userid)
    var page = req.params.page

    console.log(req.body.institute)

    var idoc = {};
    idoc['first_name'] = req.body.FirstName;
    idoc['last_name'] = req.body.LastName;
    idoc['email'] = req.body.Email;
    if(req.body.institute != null){
        idoc['institute'] = req.body.institute;
    }
    if(req.body.position != null){
        idoc['position'] = req.body.position;
    }
    if(req.body.Time != "" && req.body.Time != null){
        idoc['percent_xenon'] = Number(req.body.Time);
    }
    if(req.body.prevTime != null) {
        idoc['previous_time'] = req.body.prevTime
    }
    if(req.body.addInst != null) {
        idoc['additional_institutes'] = req.body.addInst
    }
    if(req.body.mlist1 != null || req.body.mlist2 != null || req.body.mlist3 != null) {
        idoc['mailing_lists'] = [req.body.mlist1, req.body.mlist2, req.body.mlist3]
    }
    if(req.body.StartDate != "" && req.body.StartDate != null){
        idoc['start_date'] = new Date(`${req.body.StartDate}`);
    }
    if(req.body.EndDate != "" && req.body.EndDate != null) {
        idoc["end_date"] = new Date(req.body.EndDate)
    }

    db.collection('users').findOneAndUpdate(
        {"_id": user_id}, 
        {$set: idoc},
    (e, update) => {
        console.log(update)
    })
    console.log(`success. Modified ${req.body.FirstName} ${req.body.LastName}`)
    if (page.toString().includes("Institute")) {
        var split = page.toString().split('_')[1]
        page = 'institutes/' + split
    }
        
    return res.redirect(base + '/'+page)
})

/* POST req to add a user */
// when adding a user the following should be req:
// First name, last name, username, email, github (_+authentication)
// in edit: cell, 
// admin: % xenon, start date, end date, position, institute
router.post('/adduser', ensureAuthenticated, (req, res) => {
    var db = req.recode_db

    // Get our form values. These rely on the "name" attributes
    var idoc = {};
    idoc['first_name'] = req.body.FirstName;
    idoc['last_name'] = req.body.LastName;
    idoc['email'] = req.body.Email;
    idoc['institute'] = req.body.institute;
    idoc['position'] = req.body.position;
    idoc['percent_xenon'] = req.body.Time;
    idoc['mailing_lists'] = [req.body.mlist1, req.body.mlist2, req.body.mlist3]
    if(req.body.StartDate != ""){
        idoc['start_date'] = new Date(`${req.body.StartDate}`);
    }
    
    var mailing_lists = ""
    if (req.body.mlist1 != null) 
        mailing_lists += req.body.mlist1
        mailing_lists += " "
    if (req.body.mlist2 != null) 
        mailing_lists += req.body.mlist2
        mailing_lists += " "
    if (req.body.mlist3 != null) 
        mailing_lists += req.body.mlist3
        mailing_lists += " "    

    try {
        NewUserMail(req, mailing_lists, function(success){
            if (success) {
                db.collection('users').insertOne(idoc)
                console.log(`success. Added ${req.body.FirstName} ${req.body.LastName}`)
                res.redirect(`${base}/institutes/${req.body.institute}`)
            } else {
                console.log("error. Could not send email.")
                res.redirect(`${base}/institutes/${req.body.institute}`)
            }
        })
    } catch (e) {
        console.log(e)
    }
})

function NewUserMail(req, mailing_lists, callback){
    // send mail
    var transporter = req.transporter;
    var message = {
        from: process.env.NOTIFS_ACCOUNT,
        to: process.env.MAILING_LIST,
        subject: 'New Member Confirmation: ' + req.body.FirstName + ' ' + req.body.LastName,
        html: '<p>Hi,</p>' 
            + '<p>A new member has been added by ' + req.user.first_name + ' ' + req.user.last_name + ' at ' + req.body.institute + ' that needs access to midway: <br>' 
            + 'a) Name: ' + req.body.FirstName + ' ' + req.body.LastName + '<br>'
            + 'b) email: ' + req.body.Email + '<br>'
            + 'c) Position: ' + req.body.position + '<br>'
            + 'd) Time: ' + req.body.Time + '%<br>'
            + 'e) Tasks: ' + req.body.Tasks + '<br>'
            + 'f) Mailing lists: ' + mailing_lists + '<br>'
            + 'g) Start date: ' + req.body.StartDate + '<br>'
            + 'h) End date: ' + req.body.expectedEnd + '<br>'
            + '<p>Thanks!<br>XENON User Management</p>'
    };
    
    transporter.sendMail(message, function(error, info){
        if (error) {
            console.log(error);
            callback(false);
        } else {
            console.log("Message sent: " + info.message)
            callback(true);
        }
    });
}

module.exports = router;