var express = require("express")
var router = express.Router()

// authentication from nodiaq?

router.get('/', (req, res) => {
    res.send('user directory')
})

router.get('/userlist', (req, res) => {
    var db = req.db
    // return res.send("Doesn't work :(")
    var collection = db.get('users')
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });

    // collection.find({}).toArray(function(err, docs) {
    //     assert.equal(null, err);
    //     assert.equal(3, docs.length);
    //     return res.send(JSON.stringify(docs))
       
    //   });
    // collection.find({}, {}, (e, docs) => {
    //     return res.send(JSON.stringify(docs))
    // })
    // collection.find({}, {}, (e, docs) => {
	// 		    return res.render('userlist', {"userlist": docs})
	// 	    })
})

module.exports = router;