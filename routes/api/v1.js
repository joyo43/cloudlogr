// any verb to /api/v1 is handled here

var express = require('express');
var router = express.Router();
module.exports = router;
var Schedule = require('../../models/schedule');
var request = require('request');

//----------------------------------------------//
//    API route to create a new Schedule        //
//----------------------------------------------//
// this route creates a Schedule object. It is not available via the UI yet
// attributes are currently hard-coded, would be brought in as form fields
// in a *large form, not good UX!
// what would be required to allow the user to create a Schedule?
// how would it be validated before saving it?
router.post('/newSchedule', function(request, response) {
  var clock = new Date(); // set 'clock' as the current time of the server
  var newSchedule = Schedule({ //create a new Schedule model
    user: 'Jason',
    email: 'outbackdog@gmail.com',
    dataAddress: 500, // not being used with current route
    dataTagname: "Tank_3_gal.",
    dataPollRate: 10000,
    dataPollingState: false
  });
  newSchedule.startPolling();
  newSchedule.save(function(err, schedule){ // err is returned if error, else updated schedule is
    if (err) res.send(err);
    else {
      response.send('Schedule saved!' + schedule + ' newSchedule = ' + newSchedule);
      console.log("new schedule saved to DB");
    };
  });
});


//----------------------------------------------//
//    API route to start polling                //
//----------------------------------------------//
router.post('/startPolling', function(request, response) {
  // check for dataPollingState == false, if found change to true and start polling, if not found, error
  Schedule.findOneAndUpdate( { user: 'Jason', dataPollingState: false }, { dataPollingState: true }, {new: true}, function(err, schedule){ // after write, database returns schedule
      // err is returned if error, else updated schedule is
      // console.log(schedule);
      if (schedule){
        schedule.readEwonOnce(); // read immediately
        schedule.startPolling(); // start polling, first will be in dataPollRate ms
        console.log('hit startPolling. dataPollingState is now: ' + schedule.dataPollingState);
        response.send(true);
      } else {
        response.send(false);
      }
    });
});


//----------------------------------------------//
//    API route to stop polling                 //
//----------------------------------------------//
router.post('/stopPolling', function(request, response) { // change dataPollingState to false in DB
  Schedule.findOneAndUpdate( { user: 'Jason' }, { dataPollingState: false }, { new: true }, function(err, schedule){ // after write, database returns schedule
      // err is returned if error, else updated schedule is
      if (schedule){ // if a matching schedule is found in the DB,
        response.send(true);
        console.log('hit stopPolling. dataPollingState is now: ' + schedule.dataPollingState);
      }
      else {
        response.send(false);
        console.log('hit stopPolling. dataPollingState is now: ' + schedule.dataPollingState);
      };
  });
});


//----------------------------------------------//
//    API route to change poll rate             //
//----------------------------------------------//
// post to /api/vi/changePollRate with newDataPollRate: in body
// if not already polling, change poll rate and return new poll rate
// if already polling, return 'stop polling before changing the rate'
// if a bad poll rate is specified, return 'bad poll rate'
router.post('/changePollRate', function(request, response) {
  //response.send(request.body);
  Schedule.findOneAndUpdate( { user: 'Jason', dataPollingState: false }, { dataPollRate: request.body.newDataPollRate }, { new: true, runValidators: true }, function(err, schedule){ // after write, database returns schedule
      // err is returned if error, else updated schedule is
      if (schedule){ // if a schedule is returned, the update was possible,
        response.send(schedule);
        console.log('hit changePollRate. dataPollRtate is now: ' + schedule.dataPollRate + 'ms');
      }
      else {
        response.send(err);
        console.log('hit changePollRate. err: ' + err + 'schedule: ' + schedule);
      };
  });
});

//----------------------------------------------//
//    API route to get an eWON reading          //
//----------------------------------------------//
 router.get('/oneReading', function(request, response){
   Schedule.findOne( { user: 'Jason' }, function(err, schedule){ // get entry with user: Jason from DB
     if (schedule) {
       schedule.readEwonOnce(response); // will read eWON, save the data to the DB and redirect to /tank
     } else { response.send('could not find user: Jason.  Error: ' + err);
       // response.send('the schedule is: ' + schedule); works
     };
   });
 });


//----------------------------------------------//
//    API route to update settings of schedule  //
//----------------------------------------------//


//----------------------------------------------//
//    API route to change the process inputs    //
//----------------------------------------------//
