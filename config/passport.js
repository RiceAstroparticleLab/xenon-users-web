var passport = require('passport');

// GithubStrategy
var GitHubStrategy = require('passport-github2').Strategy;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_SECRET_KEY;
var CALLBACK_URL = process.env.CALLBACK_URL;

// connecting MONGO
const MongoClient = require('mongodb').MongoClient
var local_uri = process.env.MONGO_LOCAL_URI
var use_db
MongoClient.connect(local_uri, {useUnifiedTopology: true}, (err, db) => {
    use_db = db.db('test'),
    err => {console.log(err)}
})

console.log("Runs db in user auth " + local_uri);

// Should I use mongoose for serialization??
// Here the complete acct is serialized/deserialized
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: ["user:email", "user:name", "user:login", "user:id"]
  }, 
  function (accessToken, refreshToken, profile, done) {

    // asynchronous verification 
    process.nextTick(() => {
        use_db.collection('users').find({"github": profile._json.login}).toArray((e, docs) => {
                            if(docs.length===0){
                                console.log("Couldn't find user in run DB, un "+profile._json.login);
                                return done(null, false, "Couldn't find user in DB");
                            }
                            console.log("profile: " + JSON.stringify(docs[0]));
            return done(null, docs[0], "Verification success");
        });
    });
}));

// TAKE A LOOK AT LOCAL AUTH 
