var passport = require('passport');

// GithubStrategy
var GitHubStrategy = require('passport-github2').Strategy;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_SECRET_KEY;
const CALLBACK_URL = process.env.CALLBACK_URL;
var CALLBACK_LOCAL_URL = process.env.CALLBACK_LOCAL_URL;

// LocalStrategy
var LocalStrategy = require('passport-local').Strategy;
const GENERAL_LOGIN_PW = process.env.GENERAL_LOGIN_PW;

// connecting MONGO
const MongoClient = require('mongodb').MongoClient
var local_uri = process.env.MONGO_LOCAL_URI
var use_db
MongoClient.connect(local_uri, {useUnifiedTopology: true}, (err, db) => {
    use_db = db.db('xenon'),
    err => {console.log(err)}
})

console.log("Runs db in user auth ");

// Should I use mongoose for serialization??
// Here the complete acct is serialized/deserialized not just user ID
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Login with github
passport.use(new GitHubStrategy({
    clientID: process.env.TEST_CLIENT_ID, // GITHUB_CLIENT_ID
    clientSecret: process.env.TEST_SECRET_KEY, // GITHUB_CLIENT_SECRET
    callbackURL: process.env.TEST_CALLBACK_URL, //CALLBACK_URL
    scope: ["read:user", "read:org"]
  }, 
  function (accessToken, refreshToken, profile, done) {
      // console.log(profile._json)

    // asynchronous verification 
    process.nextTick(() => {
        use_db.collection('users').find({"github": profile._json.login}).toArray((e, docs) => {
                            if(docs.length===0){
                                console.log("Couldn't find user in run DB, un "+profile._json.login);
                                return done(null, false, "Couldn't find user in DB");
                            } else {
                                use_db.collection('users').findOneAndUpdate({"github": profile._json.login},
                                                    {"$set": { "picture_url": profile._json.avatar_url,
                                                               "github_home": profile.html_url,
                                                               "token": accessToken},
                                                    }, {returnOriginal: false}, (e, update) => {
                                                        // console.log(update.value)
                                                        return done(null, update.value, "Verification success");
                                                    })
                                // console.log(result)
                            }
        });
    });
}));

// Login with Local username/pw
passport.use(new LocalStrategy(
  function(username, password, done) {
      console.log(`** USERNAME`)
        use_db.collection('users').find({"email": username}).toArray((e, docs) => {
            if (e) {return done(e)}
            if(docs.length===0) {
                console.log(`Couldn't find user ${username} in DB`);
                return done(null, false, { message: "Couldn't find user in DB" });
            }
            if (`${password}` != GENERAL_LOGIN_PW) {
                console.log(`${username} typed in the wrong password`)
                return done(null, false, { message: "Wrong password"});
            }
            console.log("Correct user and password")
            return done(null, docs[0])
      })
  }
))