// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const dns = require('node:dns');

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');

app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204
app.use(bodyParser.urlencoded({ extended: false }))

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

var users = [];
app.post('/api/users', (req, res) => {
  let id = undefined;
  for(let i=0; i< users.length; i++) {
    if(users[i].username === req.body['username']) {
      id = i;
      break;
    }
  }
  if(!id) {
    users.push({ "username": req.body['username'], "_id": users.length.toString() });
    id = users.length - 1;
  }
  res.send(users[id]);
});

app.get("/api/users", (req, res) => {
  //console.log(users);
  res.send(users);
});

var exercises = [];
app.post("/api/users/:id/exercises", (req, res) => {
  const id = req.params['id'];
  // exercises.push({ 
  //   "username": users[id].username,
  //   "description": req.body["description"],
  //   "duration": Number(req.body['duration']),
  //   "date": req.body['date'] ? (new Date(req.body['date'])).toDateString() : (new Date()).toDateString(),
  //   "_id": id,
  // });
  // console.log(exercises[exercises.length-1]);
  // res.send(exercises[exercises.length-1]);
  //for(let i=0; i< users.length; i++) {
    //if(users[i]._id === id) {
      users[id].description = req.body["description"];
      users[id].duration = Number(req.body['duration']);
      users[id].date = req.body['date'] ? (new Date(req.body['date'])).toDateString() : (new Date()).toDateString();
      //break;
    //}
  //}
  console.log(req.body, users[id]);
  res.send(users[id]);
});

var urls = [];
app.post("/api/shorturl", function (req, res) {
  //console.log(req.body['url']);
  try {
    const url = new URL(req.body['url']);
    console.log(url.protocol);
    if(url.protocol!=="http:") throw new Error();
    urls.push(url.href);
    console.log(urls[urls.length-1]);
    res.json({ "original_url": req.body['url'], "short_url": urls.length-1 });
  } catch (error) {
    console.log("erro", error); // => TypeError, "Failed to construct URL: Invalid URL"
    res.json({ "error": "invalid url" });
  }
});

app.get("/api/shorturl/:url", function (req, res) {
  try {
    const id = req.params['url'];
    const url = urls[id];
    console.log(id, urls[id]);
    res.redirect(url);
    return;
    dns.lookup(url, (err, addr, fam) => {
      // if(err) {
      //   console.log(err);
      //   res.json({ "error": "invalid url" });
      //   return;
      // }
      console.log("addr", addr);
      res.redirect(addr);
    })
    
  } catch (error) {
    console.log("error", req.params['url']); // => TypeError, "Failed to construct URL: Invalid URL"
    res.json({ "error": "invalid url" });
  }
});

app.get("/api/whoami", function (req, res) {
  let forwarded = req.headers['x-forwarded-for']
  let ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
  res.json({ "ipaddress": ip, "language": "ptBR", "software": "VS Code" });
});

app.get("/api/:date", function (req, res) {
  try {
    const param = Number(req.params['date']) == req.params['date'] ? Number(req.params['date']) : req.params['date'];
    const date = new Date(param);
    if(isNaN(date.getTime())) {
      res.json({ "error": "Invalid Date" });
    } else {
      const ret = { "unix": date.getTime(), "utc": date.toUTCString()};
      console.log(param, req.params['date'], date, ret);
      res.json(ret);
    }
  } catch(err) {
    console.log(err);
  }
  //res.sendFile(__dirname + '/views/index.html');
});

app.get("/api", function (req, res) {
  const date = new Date();
  const ret = { "unix": date.getTime(), "utc": date.toUTCString()};
  res.json(ret)
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});



// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on http://localhost:' + listener.address().port);
});
