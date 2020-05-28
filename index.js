var createError = require('http-errors');
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan');

// connect to the mongo server
// const testMongoURI = 'mongodb://localhost:27017/nodetest1'
const MongoClient = require('mongodb').MongoClient
var monk = require('monk')
const mongoURI = 'mongodb://recode:WebFrameworksRock@fried.rice.edu:27017/admin?readPreference=secondary'
var dbx
MongoClient.connect(mongoURI, {useUnifiedTopology: true}, (err, db) => {
    dbx = db.db("xenonnt")
    // dbx.collection("users").find().toArray((err, result) => {
    //     if(err) throw err
    //     console.log(result)
    //     db.close()
    // })
})

//const client = new MongoClient(mongoURI, {useUnifiedTopology: true})
// client.connect().then(client => 
//     client.db().admin().listDatabases()
// ).then(dbs => {
    
//     console.log("Mongo databases", dbs)
// }).finally(() => client.close())

// monk(mongoURI).then(
//      () => {console.log(`mongoDB is connected to ${mongoURI} using monk`)},
//      err => {console.log(err)}
// )
// mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}).then(
//     () => {console.log(`mongoDB is connected to ${mongoURI}`)},
//     err => {console.log(err)}
// )


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
    req.dbx = dbx
    next()
})

app.listen(port, () => console.log(`Listening on port ${ port }`))
app.use('/', landingRouter);
app.use('/users', userRouter);

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