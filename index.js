var createError = require('http-errors');
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan');
var dotenv = require('dotenv')

dotenv.config()
// connect to the mongo server
const MongoClient = require('mongodb').MongoClient
const mongoURI = process.env.MONGOLAB_URI
var xenonnt_db
var run_db
MongoClient.connect(mongoURI, {useUnifiedTopology: true}, (err, db) => {
    xenonnt_db = db.db("xenonnt"),
    run_db = db.db("run"),
    recode_db = db.db("recode")
    console.log(`mongoDB is connected to ${mongoURI}`),
    err => {console.log(err)}
})


// Routers for subsites
var landingRouter = require('./routes/pages');
var userRouter = require('./routes/users');

/* using Express */
const app = express()
const port = process.env.PORT || 3000

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
    req.xenonnt_db = xenonnt_db
    req.run_db = run_db
    req.recode_db = recode_db
    next()
})

app.listen(port, () => console.log(`Listening on port ${ port }`))
app.use('/', landingRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404))
})
  
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}
  
    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app