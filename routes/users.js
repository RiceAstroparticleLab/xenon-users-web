var express = require("express")
var router = express.Router()

// authentication from nodiaq?

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
    var mlists = req.body.mlist1 || req.body.mlist2 || req.body.mlist3;
    var start = req.body.StartDate;
    var end = req.body.EndDate;
    try {
        db.collection('users').insertOne({
            "first_name": firstName,
            "last_name": lastName,
            "email": userEmail,
            "institute": instituteName,
            "position": position,
            "time": time,
            "tasks": tasks,
            "mailing_lists": mlists,
            "start_date": start,
            "end_date": end
        })
        console.log(`success. Added ${firstName} ${lastName}`)
        res.redirect(`/institutes/${instituteName}`)
    } catch (e) {
        console.log(e)
    }
})

// remove a user: really just means set an end date

// find and modify

router.post('/getDirectory', (req, res) => {
    var db = req.users_db;
    var collection = db.get("users");
    collection.find({}, {"sort": {"last_name": -1}},
		    function(e, docs){
			return res.send(JSON.stringify({"data": docs}));
		    });
});

module.exports = router;