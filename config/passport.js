var passport = require('passport');

// GithubStrategy
var GitHubStrategy = require('passport-github2').Strategy;
var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
var GITHUB_CLIENT_SECRET = process.env.GITHUB_SECRET_KEY;

// connecting MONGO
const MongoClient = require('mongodb').MongoClient
var local_uri = process.env.MONGO_LOCAL_URI
var test_db
MongoClient.connect(local_uri, {useUnifiedTopology: true}, (err, db) => {
    test_db = db.db('test'),
    err => {console.log(err)}
})

console.log("Runs db in user auth " + local_uri);

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj)
});

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function UpdateUnique(mongo_doc, username, collection){
    return new Promise(resolve => {
	collection.find({"daq_id": username}, function(e, docs){
	    if(docs.length !== 0)
		return(UpdateUnique(mongo_doc, "xe"+username, collection));
	    collection.update({"last_name": mongo_doc['last_name'],
			       "first_name": mongo_doc['first_name'],
			       "institute": mongo_doc['institute']},
			      {"$set": {"daq_id": username}});
	    resolve(username);
	});	    
    });
}

function GenerateDAQID(mongo_doc){
    // Just return the last name in lower case. In case not unique add the string 'xe' 
    // until it is and maybe auto-email parents to be more creative next time.
    // Remove diacritics from last name as well

    // This probably makes it clear that the whole async/promise thing is still hazy
    if(typeof mongo_doc['daq_id'] !== 'undefined')
	return new Promise(resolve => {
	    resolve(mongo_doc['daq_id']);
	});

    var last_name = mongo_doc['last_name'];
    var username = last_name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Check uniqueness
    var collection = test_db.get("users");
    return new Promise(resolve => {
	resolve(UpdateUnique(mongo_doc, username, collection));
    });
}

async function PopulateProfile(mongo_doc, github_profile, ldap_profile, callback){

    var ret_profile = {};

    // This step important. We need a unique identifier for each user. The user
    // doesn't actually need to see this but it's important for some internal 
    // things.     
    ret_profile['daq_id'] = await GenerateDAQID(mongo_doc);
    console.log(ret_profile);
    console.log("HERE");

    var extra_fields = ['skype', 'github_id', 'cell',
                        'favorite_color', 'email', 'lngs_ldap_uid',
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
    // display API key set or not                                              
    if(typeof mongo_doc['api_username'] !== 'undefined')
        ret_profile['api_key'] = "SET";
    
    callback(ret_profile);
}

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },(accessToken, refreshToken, profile, done) => {
      console.log(profile)
      // asynchronous verification 
      process.nextTick(() => {
          var db = test_db;
          db.collection('users').find({"github": profile._json.login}).toArray((e, docs) => {
                              if(docs.length===0){
                                  console.log("Couldn't find user in run DB, un "+profile._json.login);
                                  return done(null, false, "Couldn't find user in DB");
                              }
                              var doc = docs[0];
                              console.log(`This is the doc: ${doc}`)
                              PopulateProfile(doc, profile, {}, function(ret_profile){
				  // Save a couple things from the github profile
				  db.collection('users').updateOne({"github": profile._json.login},
                                                    {"$set": { "picture_url": profile._json.avatar_url,
                                                               "github_home": profile.html_url}
                                                    });
			      
				  return done(null, ret_profile);
			      });
			  });
      });
  }));

// TAKE A LOOK AT LOCAL AUTH AS WELL
