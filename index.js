'use strict';

// [START app]
const express = require('express');
const fs = require('fs')
const app = express();
let busboy = require('connect-busboy')

app.use(busboy());

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
  console.log('Authorized calles')
  res.status(200).send('Hello, code='+req.query.code).end();
});
const homepage = '<html> \
  <head> \
    <title>node.js - example</title> \
  </head> \
  <body> \
      <form id="uploadForm" \
         enctype="multipart/form-data" \
         action="/authorize" \
         method="post"> \
      <input type="submit" value="Authorize" name="submit"> \
    </form> \
  </body> \
</html>'
app.post('/authorize', (req,res) => {
    console.log('Requesting')
    res.redirect('https://www.strava.com/oauth/authorize?client_id=18139&response_type=code&redirect_uri=http://localhost:8080/authorized&scope=write&state=mystate&approval_prompt=force')
})
app.get('/',  (req, res) => {
  res.status(200).send(homepage).end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]