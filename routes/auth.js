var express = require("express")
var router = express.Router()
var passport = require("passport")
var base = '/shifts'

// auth login page
router.get('/login', (req, res) => {
    res.render('login', {page: 'Login', menuId: 'home', user: req.user})
})

// failed login attempt
router.get('/login_attempt_1vn9ub480ng49', (req, res) => {
    res.render('wrong_pass', {page: 'Login', menuId: 'home', user: req.user, message: 'The email or password you entered is incorrect', link: null})
})

router.get('/login_attempt_2cn9rbu94gi4n', (req, res) => {
    res.render('wrong_pass', 
        {page: 'Login',
         menuId: 'home',
         user: req.user,
         message: 'Error: You do not appear to be in our database. Please link your account on the',
         link: 'https://xenon1t-daq.lngs.infn.it/login'})
})

router.get('/login_attempt_3poiux93jxm023', (req, res) => {
    res.render('wrong_pass', 
        {page: 'Login', 
         menuId: 'home', 
         user: req.user, 
         message: 'Error: Please make sure that your username/password is correct and that you have linked your account on the',
         link: 'https://xenon1t-daq.lngs.infn.it/login'})
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
		failureRedirect: base+'/auth/login_attempt_3poiux93jxm023'}), 
	    function(req, res){
		res.redirect(base + '/profile');
	    });

// local authentication
router.post('/password', 
  passport.authenticate('local', {failureRedirect: base + '/auth/login_attempt_1vn9ub480ng49'}),
  (req, res) => {
      res.redirect(base + '/profile')
  }
);

// callback link
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: base + '/auth/login_attempt_2cn9rbu94gi4n' }),
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