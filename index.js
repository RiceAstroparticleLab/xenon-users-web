const express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
const app = express()
const mongoose = require('mongoose')
const monk = require('monk')

const port = process.env.PORT || 3000
// connect to the mongo server
// const testMongoURI = 'mongodb://localhost:27017/nodetest1'
const mongoURI = 'mongodb://recode:WebFrameworksRock@fried.rice.edu:27017/admin'
var db = monk(mongoURI)

mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}).then(
    () => {console.log(`mongoDB is connected to ${mongoURI}`)},
    err => {console.log(err)}
)

// Routers for subsites
var landingRouter = require('./routes/landing');
var userRouter = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use((req,res,next) => {
    req.db = db
    next()
})

app.listen(port, () => console.log(`Listening on port ${ port }`))
app.use('/', landingRouter);
app.use('/users', userRouter);

module.exports = app