var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var dotenv = require('dotenv'); // LOCAL TESTING ONLY

// dotenv.config(); // LOCAL TESTING ONLY

// connect to the mongo server
const MongoClient = require('mongodb').MongoClient;
const mongoURI = process.env.DAQ_MONGO_URI;
var recode_db;
var xenonnt_db;
var institutes;
MongoClient.connect(mongoURI, {useUnifiedTopology: true}, (err, db) => {
  recode_db = db.db('recode');
  xenonnt_db = db.db("xenonnt");
  // get list of distinct institutes
  xenonnt_db.collection('users').distinct(
    "institute", 
    { active: "true",
      pending: {$exists: false},
      institute: {$ne: "Common Fund"}
    }
  ).then(function(docs) {
    institutes = docs;
  });
  console.log(`mongoDB is connected to remote mongo`),
  err => {console.log(err);}
});

// For email confirmations
var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  // Using SMTP for mail
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false
});

// Routers for subsites
var landingRouter = require('./routes/pages');
var userRouter = require('./routes/users'); 
var instituteRouter = require('./routes/institutes');
var authRouter = require('./routes/auth');
var shiftRouter = require('./routes/shifts');
var adminRouter = require('./routes/admin');

/* using Express */
const app = express();

// Session caching
var session = require('express-session');
// var MongoDBStore = require('connect-mongodb-session')(session);			
// var store = new MongoDBStore({
//   uri: process.env.MONGO_LOCAL_URI,
//   collection: 'mySessions'
// });
 
// store.on('connected', function() {
//   store.client; // The underlying MongoClient object from the MongoDB driver
// });

// // Catch errors
// var assert = require("assert");
// store.on('error', function(error) {
//   assert.ifError(error);
//   assert.ok(false);
// });
 
app.use(session({
  secret: process.env.EXPRESS_SESSION,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  // store: store,
  // Boilerplate options, see:
  // * https://www.npmjs.com/package/express-session#resave
  // * https://www.npmjs.com/package/express-session#saveuninitialized
  resave: false,
  saveUninitialized: false
}));

// Passport Auth
var passport = require("passport");
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use((req,res,next) => {
  req.recode_db = recode_db;
  req.xenonnt_db = xenonnt_db;
  req.transporter = transporter;
  req.array_of_institutes = institutes;
  next();
});

app.use('/', landingRouter);
app.use('/users', userRouter);
app.use('/institutes', instituteRouter);
app.use('/auth', authRouter);
app.use('/shifts', shiftRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
  
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500);
  res.render('error');

});

app.listen(process.env.PORT, () => {
  console.log(`Server running on :${process.env.PORT}`);
});

module.exports = app
