'use strict';

// [START app]
const express = require('express');
const fs = require('fs')
const app = express();
let busboy = require('connect-busboy')

app.use(busboy());
app.use(express.static('.'))
app.post('/upload/*', function(req, res) {
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldname, file, filename) {
        console.log('req=',req)
        var fstream = fs.createWriteStream('./' + req.params[0] + filename); 
        file.pipe(fstream);
        fstream.on('close', function () {
            res.send('upload succeeded!');
        });
    });
});
app.get('/authorized', (req, res) => {
    console.log('Authorized called')
    var request = require('request');
    
    request.post('https://www.strava.com/oauth/token',
                { form: { client_id: '18139' ,
                        client_secret: '2105c2cd90aecfd363292768471d0a51c91b7248',
                            code: req.query.code }},
        function (error, response, body) {
            console.log('error=', error)
            if (!error && response.statusCode == 200) {
                var resp = JSON.parse(body)
                console.log(resp.access_token)
                res.send('Welcome '+resp.athlete.firstname+' '+resp.athlete.lastname+' token='+ resp.access_token )
                // res.write('code=',response.access_token)
            }
        }
    )
});

app.post('/authorize', (req,res) => {
    console.log('Requesting')
   res.redirect('https://www.strava.com/oauth/authorize?client_id=18139&response_type=code&redirect_uri=http://track-my-trip-dot-minecraft-161209.appspot.com/authorized&scope=write&state=mystate&approval_prompt=force')
// res.redirect('https://www.strava.com/oauth/authorize?client_id=18139&response_type=code&redirect_uri=http://localhost:8080/authorized&scope=write&state=mystate&approval_prompt=force')

})
var polyline = require('polyline')
function compare(a,b) {
    var ad = new Date(a.start_date)
    var bd = new Date(b.start_date)
  if (ad < bd)
    return -1;
  if (ad > bd)
    return 1;
  return 0;
}
app.get('/summaries', (req0,res) => {

    console.log('Summaries')
    var polylines = []
    var request = require('request')
    var activitiesJson = '';
    var options = {
        url: 'https://www.strava.com/api/v3/athlete/activities?per_page=200',
        headers: {
            Authorization: 'Bearer e33cf1d994e8444f063337634b763d80b5588a6b' 
        }
    };
    var req = request.get(options)
    req.on('data', function(d) {
        // console.info('data', d)
        activitiesJson += d;
    })
    req.on('error', function(err){
        console.info('Error: ', err)   
    })
    req.on('end', function() {
        //console.info('Activities read')
        var activities = JSON.parse(activitiesJson)   
        console.log('nActivities=',activities.length) 
        var sortedActivities = activities.sort(compare)
        var totalDistance = 0
        var totalElevation = 0
        sortedActivities.forEach(function(element) {
            console.log(element.name)
            if (element.name.indexOf(req0.query.prefix) == 0)
            {
                totalDistance += element.distance 
                totalElevation += element.total_elevation_gain 
                var polyline1 = []
                // console.log(element.id, ' date=', element.start_date)
                var sumLine = polyline.decode(element.map.summary_polyline)
                sumLine.forEach(function(point){
                    polyline1.push(point)
                }, this)
                polylines.push(polyline1)
            }
        }, this);
        var returnValue = {'distance': totalDistance, 'elevation': totalElevation, 'polyline': polylines }
        res.header("Access-Control-Allow-Origin", "*")
        res.send(JSON.stringify(returnValue,2))
    })
})
app.get('/photos', (req0,res) => {

    console.log('Photos')
    var photos = []
    var request = require('sync-request')

    var getResult = request('GET', 'https://www.strava.com/api/v3/athlete/activities?per_page=200', {
        'headers': {
            Authorization: 'Bearer e33cf1d994e8444f063337634b763d80b5588a6b' 
        }
    })

        //console.info('Activities read')
        var activities = JSON.parse(getResult.body)   
        console.log('nActivities=',activities.length) 
        var sortedActivities = activities.sort(compare)
        
        sortedActivities.forEach(function(element) {
            console.log(element.name+', id='+element.id)
            if (element.name.indexOf(req0.query.prefix) == 0)
            {
                var getResult = request('GET', 'https://www.strava.com/api/v3/activities/'+element.id+'/photos?photo_sources=true', {
                    'headers': {
                        Authorization: 'Bearer e33cf1d994e8444f063337634b763d80b5588a6b' 
                    }
                })
                
                var activityPhotos = JSON.parse(getResult.body)
                console.log('nphotos=',activityPhotos.length)
                activityPhotos.forEach(function(element){
                    photos.push(element)
                })        
            }
        }, this);
        console.log('sendin')
        res.header("Access-Control-Allow-Origin", "*")
        res.send(JSON.stringify(photos,2))
   
})
app.get('/activities', (req0,res) => {

    console.log('activities')
    var request = require('request')
    var activityNames = []
    var activitiesJson = '';

    var options = {
        url: 'https://www.strava.com/api/v3/athlete/activities?per_page=200',
        headers: {
            Authorization: 'Bearer e33cf1d994e8444f063337634b763d80b5588a6b' 
        }
    };
    var req = request.get(options)
    req.on('data', function(d) {
        // console.info('data', d)
        activitiesJson += d;
    })
    req.on('error', function(err){
        console.info('Error: ', err)   
    })
    req.on('end', function() {
        var activities = JSON.parse(activitiesJson)   
        
        activities.forEach(function(element) {
            activityNames.push(element.name)
        }, this);

        console.log('CoordsLength=',activityNames.length)
        res.header("Access-Control-Allow-Origin", "*")
        res.send(JSON.stringify(activityNames,2))
    })
})
// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]