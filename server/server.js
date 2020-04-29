var express = require('express');
var request = require('request');
var cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const result = require('dotenv').config();

const jishoUrl = 'http://beta.jisho.org/api/v1/search/words',
      wikiUrl = 'https://en.wiktionary.org/w/api.php',
      mongoUrl = 'mongodb://localhost:27017',
      port = 3001;

if (result.error) {           //                dotenv
  throw result.error
}

var app = express();
app.use(cors());


//                                              ROUTES

//jisho PROXY
app.get('/', function(req, res) {
  let url = jishoUrl + req.url;
  req.pipe(request(url)).pipe(res);
  console.log('Request received', url);
  res.status(200);
});


//ACC DATA
app.get('/acc', function(req, res) {
  let url = wikiUrl + req.url;
  req.pipe(request(url)).pipe(res);
  console.log('Request received', url);
  res.status(200);
});

//MONGO DB
app.get('/mongoreadcards', function(req, res) {
  let url = mongoUrl;
  MongoClient.connect(url, function(err, client) {
    if(!err)
    {
      assert.equal(null, err);
      console.log("Connected successfully to server. URL: ", url, 'req.query.id:' , req.query.id);
      const db = client.db('japaneseAssDB');
      const col = db.collection('jCollection');
      col.find({id: parseInt(req.query.id)}).toArray().then(value =>
        {
          console.log('col.find req.query.id:', req.query.id, 'value:', value);
          let jsonValue = value[0].flashCards.cards.map( mapValue => JSON.parse(mapValue));
          console.log('success! value:', jsonValue);
          res.status(200).send(jsonValue);
        }, error =>
        {
          let jsonError = JSON.parse(error);
          console.log('failure! value:', jsonError);
          res.status(404).send(jsonError);
          return(error);
        }
      );
      client.close();
    }else {
      console.log(err);
      res.status(404).send(err);
      return(err);
    }
  });
  return(res);
});

//UPDATE CARDS
app.get('/mongoupdatecards', function(req, res) { // UPDATE
  let url = mongoUrl;
  // req.pipe(request(url)).pipe(res);
  // console.log('Mongo request received', url);
  // res.status(200);
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server. URL: ", url);
    const db = client.db('japaneseAssDB');
    const col = db.collection('jCollection');
    col.find({id: parseInt(req.query.id)}).toArray( (err, results) => {
      if(err){
        console.log(err);
      }else {
        if(results.length > 0)
        {
          console.log("ID found", req.query.id);
          col.updateOne({id: parseInt(req.query.id)}, {$set: {flashCards: {cards: req.query.cards}}}).then((response2, err2) =>
          {
            if(err2)
            {
              console.log('ERROR:', err2);
              client.close();
            }else{
              console.log('SUCCESS:', response2, );
              client.close();
            }
            res.status(200).send(results);
          });
        }else {
          console.log("id not found", req.query, results);
          res.status(200).send(results);
        }
      }
    })
  });
  res.status(200);
  return(res);
});

app.listen(process.env.REACT_APP_SERVER_PORT || port);

console.log('listening on port', process.env.REACT_APP_SERVER_PORT || port);

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};
