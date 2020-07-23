var express = require("express")
var router = express.Router()
var passport = require("passport")
var base = '/shifts'

// auth login page
router.get('/login', (req, res) => {
    res.render('login', {page: 'Login', menuId: 'home', user: req.user})
})

// login using github
router.get('/github', 
        passport.authenticate('github', { scope: [ 'read:user', 'read:org' ] }), 
        (req, res) => {
            // The request gets redirected to github for authentication
            // so this function is not called
})

// lngs login
router.post('/ldap',
	    passport.authenticate('ldapauth', {
		successRedirect: base+'/profile',
		failureRedirect: base+'/auth/login'}), 
	    function(req, res){
		res.redirect(base + '/profile');
	    });

// local authentication
router.post('/password', 
  passport.authenticate('local', {failureRedirect: base + '/auth/login'}),
  (req, res) => {
      res.redirect(base + '/profile')
  }
);

// callback link
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: base + '/auth/login' }),
   (req, res) => {
       //console.log(req.url)
        res.redirect(base + '/profile')
})


// auth logout page
router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect(base + '/');
})

module.exports = router;