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

// connect to the mongo server
const MongoClient = require('mongodb').MongoClient
const mongoURI = process.env.MONGOLAB_URI
// const mongoURI = process.env.MONGO_LOCAL_URI
var use_db
MongoClient.connect(mongoURI, {useUnifiedTopology: true}, (err, db) => {
    // use_db = db.db('xenon')
    use_db = db.db("recode")
    console.log(`Connected in passport`),
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

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function UpdateUnique(mongo_doc, username){
    return new Promise(resolve => {
        use_db.collection("users").find({"daq_id": username}).toArray(function(e, docs){
            console.log(docs.length)
            if(docs.length !== 0)
                return(UpdateUnique(mongo_doc, "xe"+username));
            use_db.collection("users").updateOne({"last_name": mongo_doc['last_name'],
                "first_name": mongo_doc['first_name'],
                "institute": mongo_doc['institute']},
                {"$set": {"daq_id": username}});
            resolve(username)
        });	    
    })
}

function GenerateDAQID(mongo_doc){
    // Just return the last name in lower case. In case not unique add the string 'xe' 
    // until it is

    if(typeof mongo_doc['daq_id'] !== 'undefined')
	return new Promise(resolve => {
	    resolve(mongo_doc['daq_id']);
	});

    var last_name = mongo_doc['last_name'];
    var username = last_name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Check uniqueness
    return new Promise(resolve => {
        resolve(UpdateUnique(mongo_doc, username));
        });
}

async function PopulateProfile(mongo_doc, github_profile, ldap_profile, callback){

    var ret_profile = {};

    // This step important. We need a unique identifier for each user. The user
    // doesn't actually need to see this but it's important for some internal 
    // things.     
    ret_profile['daq_id'] = await GenerateDAQID(mongo_doc);

    // This allows people to use github functions later on.
    console.log(ret_profile);

    var extra_fields = ['skype', 'github_id', 'cell', 'email', 'lngs_ldap_uid',
                        'last_name', 'first_name', 'institute', 'position',
                        'percent_xenon', 'start_date', 'LNGS', 'github',
                        'picture_url', 'github_home', 'api_username', 'groups'];
    for(var i in extra_fields){
        if(typeof mongo_doc[extra_fields[i]]==='undefined')
            ret_profile[extra_fields[i]] = "not set";
        else
            ret_profile[extra_fields[i]] = mongo_doc[extra_fields[i]];
    }
    if(!(isEmpty(github_profile))){
	    ret_profile['github_info'] = github_profile;
        // This field has a bunch of funny characters that serialize poorly
        ret_profile['github_info']['_raw'] = '';
        ret_profile['picture_url'] = github_profile._json.avatar_url;
        ret_profile['github_home'] = github_profile._json.html_url;
    }
    if(!(isEmpty(ldap_profile)))
	    ret_profile['ldap_info'] = ldap_profile;
    
    callback(ret_profile);
}

const { Octokit } = require("@octokit/rest")
const TOKEN = process.env.PERSONAL_ACCESS_TOKEN
const octokit = new Octokit({
    auth: TOKEN,
    baseUrl: "https://api.github.com",
  });

// Login with github
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID, // GITHUB_CLIENT_ID process.env.TEST_CLIENT_ID
    clientSecret: GITHUB_CLIENT_SECRET, // GITHUB_CLIENT_SECRET process.env.TEST_SECRET_KEY
    callbackURL: CALLBACK_URL, //CALLBACK_URL process.env.TEST_CALLBACK_URL
    scope: ["read:user", "read:orgs"]
  }, 
  function (accessToken, refreshToken, profile, done) {
      // console.log(profile._json)

    // asynchronous verification 
    process.nextTick(() => {
        var github_login = profile._json.login 
        octokit.orgs.checkMembershipForUser({
            org: "XENON1T",
            username: github_login,
        }).then((response) => {
            if (response.status == 204) {
                console.log(response.status)
                use_db.collection('users').find({"github": profile._json.login}).toArray((e, docs) => {
                    if(docs.length===0){
                        console.log("Couldn't find user in run DB, un "+profile._json.login);
                        return done(null, false, "Couldn't find user in DB");
                    } else {
                        var doc = docs[0]
                        PopulateProfile(doc, profile, {}, function(ret_profile){
                            use_db.collection('users').findOneAndUpdate({"github": profile._json.login},
                                            {"$set": { "picture_url": profile._json.avatar_url,
                                                       "github_home": profile.html_url},
                                            }).then(() => console.log("update done"));
                            console.log(ret_profile)
                            return done(null, ret_profile)
                        })
                    }
                });
            }
        }).catch((e) => {
            console.log(e)
            octokit.orgs.checkMembershipForUser({
                org: "XENONnT",
                username: github_login,
            }).then((response) => {
                if (response.status == 204) {
                    use_db.collection('users').find({"github": profile._json.login}).toArray((e, docs) => {
                        if(docs.length===0){
                            console.log("Couldn't find user in run DB, un "+profile._json.login);
                            return done(null, false, "Couldn't find user in DB");
                        } else {
                            var doc = docs[0]
                            PopulateProfile(doc, profile, {}, function(ret_profile){
                                use_db.collection('users').findOneAndUpdate({"github": profile._json.login},
                                                {"$set": { "picture_url": profile._json.avatar_url,
                                                        "github_home": profile.html_url},
                                                }).then(() => console.log("update done"));
                                console.log(ret_profile)
                                return done(null, ret_profile)
                            })
                        }
                    });
                    
                }
            }).catch((e) => {
                console.log(e)
                return done(null, false);
            }); 
        });     
    });
}));

// Login with LNGS 
var LdapStrategy = require('passport-ldapauth').Strategy;
var OPTS = {
  server: {
    url: process.env.LDAP_URI,
    bindDn: process.env.LDAP_BIND_DN,
    bindCredentials: process.env.LDAP_BIND_CREDENTIALS,
    searchBase: 'ou=xenon,ou=accounts,dc=lngs,dc=infn,dc=it',
      searchFilter: '(uid={{username}})' //'(uid=%(user)s)'
  },
    usernameField: 'user',
    passwordField: 'password'
};
passport.use(new LdapStrategy(OPTS,
             function(user, done) {

                 // Need to verify uid matches
                 var collection = runs_db.get("users");
                 collection.find({"lngs_ldap_uid": user.uid},
                                 function(e, docs){
                                     if(docs.length===0){
					 console.log("No user " + user.uid + " in DB");
					 return done(null, false, "Couldn't find user in DB");
				     }
				     var doc = docs[0];
				     var ret_profile = PopulateProfile(doc, {}, user, function(ret_profile){
					 // Save a couple things from the lngs profile 
					 collection.update({"lngs_ldap_uid": user.uid},
							   {"$set": { 
							       "lngs_ldap_email": user.mail,
							       "lngs_ldap_cn": user.cn
							   }
							   });
					 return done(null, ret_profile);
				     });
                                 }); // end mongo query
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
            var doc = docs[0];
            var ret_profile = PopulateProfile(doc, {}, {}, function(ret_profile){
                return done(null, ret_profile);
            });
      })
  }
))