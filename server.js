const express = require('express');
const app = express();

const Airtable = require('airtable');

const fs = require('fs');
const { createJWT, verifyJWT } = require('./auth');
const cookieParser = require('cookie-parser');


Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY
})

const base = require('airtable').base(process.env.AIRTABLE_BASE_NAME)
const table = base(process.env.AIRTABLE_TABLE_NAME)


app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

const initializedFile = './.data/initialized';

app.get('/admin/reset', (req, res) => {
  try {
    if(fs.existsSync(initializedFile)) {
      verifyJWT(req.cookies.token)
      .then(decodeToken => {
        fs.unlink(initializedFile, err => {
          if(err) {
            console.log('Error removing the file');
            res.status(500).end();
            return
          }
          res.send('Session ended');
        })
      }).catch(err => {
        res.status(400).json({message: "Invalid authorization token provided."})
      })
        
    } else {
      res.status(500).json({message: "No session started."})
    }
  }
  catch(err) {
    console.log(err);
  }
})


app.get('/admin', (req, res) => {
  if(fs.existsSync(initializedFile)) {
    //admin auth already initialized
    verifyJWT(req.cookies.token)
      .then(decodeToken => {
      res.sendFile(__dirname + '/views/admin.html')
    }).catch(err => {
      res.status(400).json({message: "Invalid auth token provided."})
    })
  } else {
    //admin auth not initialized
    const token = createJWT({
      maxAge: 60 * 24 * 365  // 1 year
    });
    
    fs.closeSync(fs.openSync('./.data/initialized', 'w'));
    
    res.cookie('token', token, { httpOnly: true, secure: true });
    res.sendFile(__dirname + '/views/admin.html');
  }
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/form', (req, res) => {
  const name = req.body.name
  const email = req.body.email
  const date = (new Date()).toISOString()

  table.create({
    "Name": name,
    "Email": email,
    "Date": date
  }, (err, record) => {
    if (err) {
      console.error(err)
      return
    }

    console.log(record.getId())
  })

  res.end()
})


// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
