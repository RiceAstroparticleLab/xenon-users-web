var express = require("express")
var router = express.Router()

// authentication from nodiaq?

/* POST req to add a user */
// when adding a user the following should be req:
// First name, last name, username, email, github (_+authentication)
// in edit: cell, 
// admin: % xenon, start date, end date, position, institute
router.post('/adduser', (req, res) => {
    var db = req.recode_db

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.Username;
    var userEmail = req.body.Email;
    var firstName = req.body.FirstName;
    var lastName = req.body.LastName;
    var instituteName = req.body.Institute;
    try {
        db.collection('users').insertOne({
            "first_name": firstName,
            "last_name": lastName,
            "username": userName,
            "email": userEmail,
            "institute": instituteName
        })
        console.log(`success. Added ${firstName} ${lastName}`)
        res.redirect(`/institutes/${instituteName}`)
    } catch (e) {
        next(e)
        console.log(e)
    }
})

// remove a user

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