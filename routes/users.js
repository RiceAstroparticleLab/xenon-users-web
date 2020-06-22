var express = require("express")
var router = express.Router()
var ObjectId = require('mongodb').ObjectId; 

// authentication
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    return res.redirect('/auth/login');
}

router.post('/updateContactInfo', ensureAuthenticated, (req, res) => {
    var db = req.test_db;
    var idoc = {};
    if(req.body.email != ""){
        idoc['email'] = req.body.email;
        req.user.email = req.body.email;
    }
    if(req.body.skype != ""){
        idoc["skype"] = req.body.skype;
	    
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
    return(res.redirect('/profile'));
}); 

router.post('/:userid/updateContactInfoAdmin', (req, res) => {
    // Get our form values. These rely on the "name" attributes
    var db = req.test_db
    var user_id = new ObjectId(req.params.userid)
    var instituteName = req.body.Institute;
    console.log(req.body.StartDate)

    var enddate = req.body.EndDate
    if(req.body.EndDate != "") {
        enddate = new Date(req.body.EndDate)
    }
    
    db.collection('users').findOneAndUpdate(
        {"_id": user_id}, 
        { 
            $set: {
                "first_name": req.body.FirstName,
                "last_name": req.body.LastName,
                "email": req.body.Email,
                "institute": instituteName,
                "position": req.body.Position,
                "percent_xenon": req.body.Time,
                "tasks": req.body.Tasks,
                "mailing_lists": [req.body.mlist1, req.body.mlist2, req.body.mlist3],
                "start_date": new Date(`${req.body.StartDate}`),
                "end_date": enddate,
            }
    },
    (e, update) => {
        console.log(update)
    })
        console.log(`success. Modified ${req.body.FirstName} ${req.body.LastName}`),
        res.redirect(`/institutes/${instituteName}`)
})

/* POST req to add a user */
// when adding a user the following should be req:
// First name, last name, username, email, github (_+authentication)
// in edit: cell, 
// admin: % xenon, start date, end date, position, institute
router.post('/adduser', (req, res) => {
    var db = req.test_db

    // Get our form values. These rely on the "name" attributes
    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    var userEmail = req.body.Email;
    var position = req.body.Position;
    var instituteName = req.body.Institute;
    var time = req.body.Time;
    var tasks = req.body.Tasks;
    var start = new Date(req.body.StartDate);
    try {
        db.collection('users').insertOne({
            "first_name": firstName,
            "last_name": lastName,
            "email": userEmail,
            "institute": instituteName,
            "position": position,
            "percent_xenon": time,
            "tasks": tasks,
            "mailing_lists": [req.body.mlist1, req.body.mlist2, req.body.mlist3],
            "mail_list_added": false,
            "start_date": start
        })
        console.log(`success. Added ${firstName} ${lastName}`)
        res.redirect(`/institutes/${instituteName}`)
    } catch (e) {
        console.log(e)
    }
})

module.exports = router;