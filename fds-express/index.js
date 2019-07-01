// Copyright 2019 The FairDataSociety Authors
// This file is part of the FairDataSociety library.
//
// The FairDataSociety library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The FairDataSociety library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the FairDataSociety library. If not, see <http://www.gnu.org/licenses/>.

// require('dotenv').config();

let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let crypto = require('crypto');
let multer  = require('multer')
let stream = require('stream');


let privateKey = process.env.PRIVATE_KEY;

const app = express();
const port = '8090';

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// var redis = require('redis');
// var client = redis.createClient(process.env.REDIS_URL);
// console.log(process.env.REDIS_URL)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

let fds = require('fds.js');
let FDS = new fds();

class File{
  constructor(content, name,options){
    this.content = content;
    this.name = name;
    this.type = options.type;
  }
}

// change subdomain value to your own value
// curl -XPOST https://api-noordung.fairdatasociety.org/account/create --data "subdomain=test23423423423223223"
// takes about 10 seconds at the moment
app.post('/account/create', (req, res) => {
  let subdomain = req.body.subdomain;
  let token = crypto.randomBytes(32).toString('hex');
  FDS.CreateAccount(subdomain, token).then( account =>{
    res.send({
      success: true,
      token: token,
      address: account.address,
      subdomain: account.subdomain
    });
  }).catch(error => {
    res.status(500).send({
      success: false,
      error: error.toString()
    });
  });
});


// curl -XPOST https://api-noordung.fairdatasociety.org/value/store --data "subdomain=test23423423423223223&token=b8ec402c4321425cac5b1e04b415e4c53fb9db80c639625af0891d56eb50c725&key=test&value=test2" 
app.post('/value/store', (req, res) => {
  let subdomain = req.body.subdomain;
  let key = req.body.key;
  let value = req.body.value;
  let token = req.body.token;
  console.log(subdomain, key, value, token)
  FDS.UnlockAccount(subdomain, token).then( account =>{
    account.storeValue(key, value).then((resp)=>{
      res.send({
        success: true,
        hash: resp
      });
    });
  }).catch(error => {
    res.status(500).send({
      success: false,
      error: error.toString()
    });
  });
});

// curl "https://api-noordung.fairdatasociety.org/value/retrieve?subdomain=test23423423423223223&token=b8ec402c4321425cac5b1e04b415e4c53fb9db80c639625af0891d56eb50c725&key=test"
app.get('/value/retrieve', (req, res) => {
  let subdomain = req.query.subdomain;
  let token = req.query.token;
  let key = req.query.key;  

  FDS.UnlockAccount(subdomain, token).then( account =>{
    account.retrieveValue(key).then((resp)=>{
      res.send({
        success: true,
        value: resp
      });
    });
  }).catch(error => {
    res.status(500).send({
      success: false,
      error: error.toString()
    });
  });
});

// curl -X POST -F 'subdomain=test23423423423223223' -F 'token=b8ec402c4321425cac5b1e04b415e4c53fb9db80c639625af0891d56eb50c725' -F 'file=@/Users/significance/Desktop/opsuc-bigger.png;type=image/png' https://api-noordung.fairdatasociety.org/files/store
app.post('/files/store', upload.single('file'), (req, res) => {
  let subdomain = req.body.subdomain;
  let key = req.body.key;
  let token = req.body.token;

  FDS.UnlockAccount(subdomain, token).then( account =>{
    let file = new File([req.file.buffer], req.file.originalname, {type: 'text/plain'});
    account.store(file).then((hash)=>{
      res.send({
        success: true
      });
    });
  }).catch(error => {
    console.log(error)
    res.status(500).send({
      success: false,
      error: error.toString()
    });
  });
});

// curl 'https://api-noordung.fairdatasociety.org/files/stored?subdomain=test23423423423223223&token=b8ec402c4321425cac5b1e04b415e4c53fb9db80c639625af0891d56eb50c725'
app.get('/files/stored', upload.single('file'), (req, res) => {
  let subdomain = req.query.subdomain;
  let token = req.query.token;

  FDS.UnlockAccount(subdomain, token).then( account =>{
    account.stored().then((stored)=>{
      res.send({
        success: true,
        stored: stored
      });
    });
  }).catch(error => {
    res.status(500).send({
      success: false,
      error: error.toString()
    });
  });
});


// curl 'https://api-noordung.fairdatasociety.org/files/stored/retrieve?subdomain=test23423423423223223&token=b8ec402c4321425cac5b1e04b415e4c53fb9db80c639625af0891d56eb50c725&index=0'
app.get('/files/stored/retrieve', (req, res) => {
  let subdomain = req.query.subdomain;
  let token = req.query.token;
  let index = req.query.index;

  FDS.UnlockAccount(subdomain, token).then( account =>{
    account.stored().then((stored)=>{
      stored[index].getFile().then(file => {
        var readStream = new stream.PassThrough();
        readStream.end(file.content[0]);

        res.set('Content-disposition', 'attachment; filename=' + file.name);
        res.set('Content-Type', file.type);         
        readStream.pipe(res);
      });
    });
  }).catch(error => {
    res.status(500).send({
      success: false,
      error: error.toString()
    });
  });
});

// curl -X POST -F 'subdomain=test23423423423223223' -F 'to=test23423423423223223' -F 'token=b8ec402c4321425cac5b1e04b415e4c53fb9db80c639625af0891d56eb50c725' -F 'file=@/Users/significance/Desktop/opsuc-bigger.png;type=image/png' https://api-noordung.fairdatasociety.org/files/send
app.post('/files/send', upload.single('file'), (req, res) => {
  let subdomain = req.body.subdomain;
  let key = req.body.key;
  let token = req.body.token;
  let to = req.body.to;

  FDS.UnlockAccount(subdomain, token).then( account =>{
    let file = new File([req.file.buffer], req.file.originalname, {type: 'text/plain'});
    account.send(to, file).then((hash)=>{
      res.send({
        success: true
      });
    });
  }).catch(error => {
    res.status(500).send({
      success: false,
      error: error.toString()
    });
  });
});

// curl 'https://api-noordung.fairdatasociety.org/files/received?subdomain=test23423423423223223&token=b8ec402c4321425cac5b1e04b415e4c53fb9db80c639625af0891d56eb50c725'
app.get('/files/received', upload.single('file'), (req, res) => {
  let subdomain = req.query.subdomain;
  let key = req.query.key;
  let token = req.query.token;

  FDS.UnlockAccount(subdomain, token).then( account =>{
    account.messages().then((received)=>{
      res.send({
        success: true,
        received: received
      });
    });
  }).catch(error => {
    res.status(500).send({
      success: false,
      error: error.toString()
    });
  });
});

// curl 'https://api-noordung.fairdatasociety.org/messages/received/retrieve?subdomain=test23423423423223223&token=b8ec402c4321425cac5b1e04b415e4c53fb9db80c639625af0891d56eb50c725&index=0'
app.get('/messages/received/retrieve', (req, res) => {
  let subdomain = req.query.subdomain;
  let token = req.query.token;
  let index = req.query.index;

  FDS.UnlockAccount(subdomain, token).then( account =>{
    account.messages().then((messages)=>{
      messages[index].getFile().then(file => {
        var readStream = new stream.PassThrough();
        readStream.end(file.content[0]);

        res.set('Content-disposition', 'attachment; filename=' + file.name);
        res.set('Content-Type', file.type);         
        readStream.pipe(res);
      });
    });
  }).catch(error => {
    res.status(500).send({
      success: false,
      error: error.toString()
    });
  });
});

// curl 'https://api-noordung.fairdatasociety.org/messages/sent?subdomain=test23423423423223223&token=b8ec402c4321425cac5b1e04b415e4c53fb9db80c639625af0891d56eb50c725'
app.get('/messages/sent', upload.single('file'), (req, res) => {
  let subdomain = req.query.subdomain;
  let token = req.query.token;

  FDS.UnlockAccount(subdomain, token).then( account =>{
    account.messages('sent').then((sent)=>{
      res.send({
        success: true,
        sent: sent
      });
    });
  }).catch(error => {
    res.status(500).send({
      success: false,
      error: error.toString()
    });
  });
});

// curl 'https://api-noordung.fairdatasociety.org/messages/sent/retrieve?subdomain=test23423423423223223&token=b8ec402c4321425cac5b1e04b415e4c53fb9db80c639625af0891d56eb50c725&index=0'
app.get('/messages/sent/retrieve', (req, res) => {
  let subdomain = req.query.subdomain;
  let token = req.query.token;
  let index = req.query.index;

  FDS.UnlockAccount(subdomain, token).then( account =>{
    account.messages('sent').then((sent)=>{
      sent[index].getFile().then(file => {
        var readStream = new stream.PassThrough();
        readStream.end(file.content[0]);

        res.set('Content-disposition', 'attachment; filename=' + file.name);
        res.set('Content-Type', file.type);         
        readStream.pipe(res);
      });
    });
  }).catch(error => {
    res.status(500).send({
      success: false,
      error: error.toString()
    });
  });
});



app.listen(port, () => console.log(`Listening on ${port}!`));