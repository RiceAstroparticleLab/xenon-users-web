var express = require('express')
var router = express.Router()

router.get('/', (req, res) => {
    var str = ('b' + 'a' + + 'a' + 'a' + 's').toLowerCase()
    res.send(`Hello World. I like ${str}`);
})

module.exports = router;