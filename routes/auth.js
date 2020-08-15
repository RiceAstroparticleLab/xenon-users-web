var express = require("express");
var router = express.Router();
var passport = require("passport");
var base = '/shifts';

// auth login page
router.get('/login', function(req, res) {
  res.render('login', {page: 'Login', menuId: 'home', user: req.user});
});

// For the failed login attempts, the random numbers are there so people
// can't just guess the url for the other errors

// failed local login attempt
router.get('/login_attempt_1vn9ub480ng49', function(req, res) {
  res.render('wrong_pass', 
    { page: 'Login', 
      menuId: 'home', 
      user: req.user, 
      message: 'The email or password you entered is incorrect', 
      link: null 
    }
  );
});

// failed GitHub login 
router.get('/login_attempt_2cn9rbu94gi4n', function(req, res) {
  res.render('wrong_pass', 
    { page: 'Login',
      menuId: 'home',
      user: req.user,
      message: 'Error: You do not appear to be in our database. Please ' +
        'link your account on the',
      link: 'https://xenon1t-daq.lngs.infn.it/login' 
    }
  );
});

// failed LNGS login
router.get('/login_attempt_3poiux93jxm023', function(req, res) {
  res.render('wrong_pass', 
    { page: 'Login', 
      menuId: 'home', 
      user: req.user, 
      message: 'Error: Please make sure that your username/password is ' + 
        'correct and that you have linked your account on the',
      link: 'https://xenon1t-daq.lngs.infn.it/login'
    }
  );
});

// login using github
router.get('/github', 
  passport.authenticate('github', {scope: ['read:user', 'read:org']}), 
  function(req, res) {
    // The request gets redirected to github for authentication
    // so this function is not called
  }
);

// LNGS login
router.post('/ldap',
	passport.authenticate('ldapauth', {
		successRedirect: base + '/profile',
    failureRedirect: base + '/auth/login_attempt_3poiux93jxm023'
  }), 
	function(req, res){
		res.redirect(base + '/profile');
  }
);

// local authentication
router.post('/password', 
  passport.authenticate('local', {
    failureRedirect: base + '/auth/login_attempt_1vn9ub480ng49'
  }),
  function(req, res) {
    res.redirect(base + '/profile');
  }
);

// callback link
router.get('/github/callback',
  passport.authenticate('github', {
    failureRedirect: base + '/auth/login_attempt_2cn9rbu94gi4n'
  }),
  function(req, res) {
    res.redirect(base + '/profile');
});

// auth logout page
router.get('/logout', function(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect(base + '/');
});

module.exports = router;