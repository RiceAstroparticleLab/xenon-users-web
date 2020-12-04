var express = require("express");
var url = require("url");
var router = express.Router();
var base = '/shifts';

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.session.returnTo = req.originalUrl;
    return res.redirect(base + '/auth/login');
}

function getNextDayOfWeek(date, dayOfWeek) {
  // day of week 0 (Mon) to 6 (Sun)
  var resultDate = new Date(date.getTime());
  resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
  return resultDate;
}

// Eventually will add the home page back probably but right now is 
// just the shift calendar.
// GET home page.
// router.get('/', ensureAuthenticated, function(req, res, next) {
//   res.render('shifts', {page: 'Home', menuId: 'home', user: req.user})
// })

// I dont actually use this but plan to eventually display current shifters
// on home page like nodiaq had
router.get('/get_current_shifters', ensureAuthenticated, function(req, res) {
  var db = req.xenonnt_db;
  var shifts = db.collection('shifts');
  var usersCol = db.collection('users');
  var today = new Date();
  shifts.find(
    {
      "start": {"$lte": today},
      "end": {"$gte": today}
    }
  ).toArray(function(e, docs) {
    var users = [];
    var qusers = [];
    for(let i in docs) {
      users.push({"shifter": docs[i].shifter, "shift_type": docs[i]['type']});
      qusers.push(docs[i]['shifter']);
    }
    
    usersCol.find({"daq_id": {"$in": qusers}}).toArray(function(err, cursor) {
      for(let i in cursor){
        for(let j in users){
          if(cursor[i]['daq_id'] === users[j]['shifter']){
            users[j]['shifter_name'] =
              cursor[j]['first_name'] + cursor[j]['last_name'];
            
            let fields = [['shifter_email', 'email'], ['shifter_phone', 'cell'],
              ['shifter_skype', 'skype'], ['shifter_github', 'github']];
            for(let k in fields){
              try {
                users[j][fields[k][0]] = cursor[j][fields[k][1]];
              }
              catch(error) {
                users[j][fields[k][0]] = 'Not set';
              }
            }				
          }
        }
      }
      return res.send(JSON.stringify(users));
    });
  });
});

// FullCalendar will call this function to populate itself
// The arguments are fixed as 'start' and 'end', which are ISO dates 
router.get('/get_shifts', ensureAuthenticated, function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('shifts');
  var q = url.parse(req.url, true).query;
  var start = new Date(q.start);
  var end = new Date(q.end);

  collection.find(
    {"start": {"$gt": start, "$lt": end}}
  ).toArray(function(e, docs) {
    var ret = [];
    for(let i = 0; i < docs.length; i++){
      let doc = docs[i];
      ret.push({
        "start": doc['start'].toISOString().substr(0, 19),
        "end": doc['end'].toISOString().substr(0, 19),
        "title": doc['type'] + ': ' + doc['shifter'] + 
            '(' + doc['institute'] + ')',
        "type": doc['type'],
        "available": doc['available'],
        "institute": doc['institute'],
        "shifter": doc['shifter']
      });
    }
    return res.send(ret); 
  });
});

// 
router.get("/total_shift_aggregates", ensureAuthenticated, function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('shifts');

  collection.aggregate([
    {"$match": {"institute": {"$ne": "none"}}}, 
    {$group: {
      "_id": { "institute": "$institute", "yr": {"$year": "$start"}}, 
      "count": {"$sum": 1}
    }}, 
    {$group: {
      "_id": "$_id.institute", "total": {"$sum": "$count"}, 
      "years": {$push: {"year": "$_id.yr", "count": "$count"}}
    }},
    {$sort: {"total": -1}}
  ]).toArray(function(err, result) {
    res.send(result);
  });
});

// list of DAQ id's for the autocomplete suggestions on the shift calendar
router.post("/get_daqids", ensureAuthenticated, function(req, res) {
    var db = req.xenonnt_db;
    db.collection('users').distinct("daq_id", function(e, docs) {
        res.send(docs);
    });
});

// not currently in use
router.get("/get_rules", ensureAuthenticated, function(req,res) {
  var db = req.xenonnt_db;
  var collection = db.collection('shifts');
  var d = new Date()
  var year = d.getFullYear().toString();
  var dat = new Date("2020-01-01")
  collection.find(
    {start: {$gte: ISODate("2020-01-01T00:00:00.000Z")}}
  ).toArray(function(err, result) {
    l = result.length
    res.send(l.toString());
  });
});

router.post('/add_shifts', ensureAuthenticated, function(req, res){
  var idoc;
  var db = req.xenonnt_db;
  // Get form data
  var weekday = req.body.shift_change_day;
  var shift_type = req.body.shift_type;
  var credit_multiplier = req.body.credit_multiplier;
  var start = 
    new Date(Date.UTC(parseInt(req.body.start_date.substr(0, 4)),
                      parseInt(req.body.start_date.substr(5, 2)) - 1, 
                      parseInt(req.body.start_date.substr(8, 2)))
  );
  var end = 
    new Date(Date.UTC(parseInt(req.body.end_date.substr(0, 4)),
                      parseInt(req.body.end_date.substr(5, 2)) - 1,
                      parseInt(req.body.end_date.substr(8, 2)))
  );

  start = getNextDayOfWeek(start, weekday);
  if (start < end){ 
    var start_of_shift = 
      new Date(Date.UTC(start.getFullYear(), start.getMonth(), 
                        start.getDate(), 0, 0, 0)
    );
    var end_of_shift = 
      new Date(Date.UTC(start.getFullYear(), start.getMonth(), 
                        start.getDate(), 0, 0, 0)
    );
    end_of_shift.setDate(start.getDate() + 7);
    end_of_shift.setHours(23, 59, 59, 0);

    idoc = {
        "start": start_of_shift,
        "end": end_of_shift,
        "type": shift_type,
        "available": true,
        "credit_multiplier": credit_multiplier,
        "institute": "none",
        "shifter": "none",
        "comment": ""
    }
  }
  db.collection('shifts').insertOne(idoc);
  return res.sendStatus(200);    
});

router.post('/remove_shifts', ensureAuthenticated, function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection("shifts");
  var start = new Date(req.body.start_date);
  var end = new Date(req.body.end_date);
  var type = req.body.shift_type;

  query = {"start": {"$gte": start, "$lte": end}, "available": true};
  if(type !== 'all') {
    query['type'] = type;
  }
  collection.removeOne(query, {multi: true});
  return res.sendStatus(200);
});

router.post('/modify_shift', ensureAuthenticated, function(req, res){
  var db = req.xenonnt_db;
  var collection = db.collection('shifts');
  var start = new Date(req.body.start_date);
  var end = new Date(req.body.end_date);

  start.setDate(start.getDate() - 1);
  end.setDate(end.getDate() + 1);
  var doc = {
        'start': start,
        'end': end,
        'shifter': req.body.shifter,
        'shift_type': req.body.shift_type,
        'institute': req.body.institute,
        'comment': req.body.comment,
        'remove': req.body.remove
  }

  // Update the shift with this user
  if (doc['remove'] === 'false') {
    collection.updateOne(
      { 
        "start": { "$gt": doc['start']}, 
        "end": { "$lt": doc['end']},
        "available": true,
        "type": doc['shift_type']
      },
      {
        "$set": {
          "shifter": doc['shifter'],
          "institute": doc['institute'],
          "comment": doc['comment'],
          "available": false
        }
      }
    ).then(function() {
      return res.sendStatus(200);
    });
  }
  else {
    // Remove the user from the shift
    try {
      collection.findOneAndUpdate(
        { 
          "start": { "$gt": doc['start']},
          "end": { "$lt": doc['end']},
          "available": false,
          "type":doc['shift_type'],
          "shifter": doc['shifter']
        },
        {
          "$set": {
            "shifter": "none",
            "institute": "none",
            "comment": '',
            "available": true
          }
        }, 
        function(){ 
          res.sendStatus(200);
        }
      );
    } catch(e) {
      console.log(e);
    }
  }
});

module.exports = router