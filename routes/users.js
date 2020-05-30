var express = require("express")
var router = express.Router()

// authentication from nodiaq?

router.get('/', function(req, res) {
    res.render('users', { title: 'User Directory', user: req.user });
});

router.post('/getDirectory', (req, res) => {
    var db = req.users_db;
    var collection = db.get("users");
    collection.find({}, {"sort": {"last_name": -1}},
		    function(e, docs){
			return res.send(JSON.stringify({"data": docs}));
		    });
});

module.exports = router;