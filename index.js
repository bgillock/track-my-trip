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
                console.log(response)
                // res.write('code=',response.access_token)
            }
        }
    )
    res.redirect('.')
});

app.post('/authorize', (req,res) => {
    console.log('Requesting')
//   res.redirect('https://www.strava.com/oauth/authorize?client_id=18139&response_type=code&redirect_uri=http://track-my-trip-dot-minecraft-161209.appspot.com/authorized&scope=write&state=mystate&approval_prompt=force')
 res.redirect('https://www.strava.com/oauth/authorize?client_id=18139&response_type=code&redirect_uri=http://localhost:8080/authorized&scope=write&state=mystate&approval_prompt=force')

})

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]