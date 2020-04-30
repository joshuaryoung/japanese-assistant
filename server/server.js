var express = require('express')
var request = require('request')
var cors = require('cors')
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const result = require('dotenv').config()
const _ = require('lodash')

const jishoUrl = 'http://beta.jisho.org/api/v1/search/words',
      wikiUrl = 'https://en.wiktionary.org/w/api.php',
      mongoUrl = `mongodb://localhost:${process.env.REACT_APP_MONGODB_PORT}`,
      port = 3001

const connectOptions = {
  auth: {
    user: process.env.REACT_APP_MONGODB_AUTH_USER,
    password: process.env.REACT_APP_MONGODB_AUTH_PASSWORD
  }
}

if (result.error) {           //                dotenv
  throw result.error
}

var app = express()
app.use(cors())


//                                              ROUTES

//jisho PROXY
app.get('/', function(req, res) {
  let url = jishoUrl + req.url
  req.pipe(request(url)).pipe(res)
  console.log('Request received', url)
  res.status(200)
})


//ACC DATA
app.get('/acc', function(req, res) {
  let url = wikiUrl + req.url
  req.pipe(request(url)).pipe(res)
  console.log('Request received', url)
  res.status(200)
})

//MONGO DB
app.get('/mongoreadcards', async (req, res) => {
  let url = mongoUrl
  const id = _.get(req, 'query.id')
  console.log({ id })
  try {
    const client = await MongoClient.connect(url, connectOptions)
    
    const db = await client.db(process.env.REACT_APP_MONGODB_DB_NAME)
    
    const col = await db.collection(process.env.REACT_APP_MONGODB_COL_NAME)

    const findRes = await col.find({ id })
    
    const results = await findRes.toArray()
    console.log({ results })

    const flashCards = _.get(results, '[0].flashCards.cards', [])
    const parsedCards = flashCards.map(card => JSON.parse(card))
    console.log({ parsedCards })
    res.status(200).send(parsedCards)
    return flashCards
  } catch (error) {
    console.log(error)
  }
  console.log({ client, type: typeof client })
  // if(!err)
  // {
  //   assert.equal(null, err)
  //   console.log("Connected successfully to server. URL: ", url, 'req.query.id:' , req.query.id)
  //   col.find({id: parseInt(req.query.id)}).toArray().then(value =>
  //     {
  //       const { query: { id } } = req
  //       console.log({ id, value })
  //       let jsonValue = value[0].flashCards.cards.map( mapValue => JSON.parse(mapValue))
  //       console.log('success! value:', jsonValue)
  //       res.status(200).send(jsonValue)
  //     }, error =>
  //     {
  //       let jsonError = JSON.parse(error)
  //       console.log('failure! value:', jsonError)
  //       res.status(404).send(jsonError)
  //       return(error)
  //     }
  //   )
  //   client.close()
  // }else {
  //   console.log(err)
  //   res.status(404).send(err)
  //   return(err)
  // }
  // return(res)
})

//UPDATE CARDS
app.get('/mongoupdatecards', async function(req, res) { // UPDATE
  let url = mongoUrl
  const id = _.get(req, 'query.id')
  // req.pipe(request(url)).pipe(res)
  // console.log('Mongo request received', url)
  // res.status(200)
  try {
    const client = await MongoClient.connect(url, connectOptions)
    
    console.log("Connected successfully to server. URL: ", url)

    const db = await client.db(process.env.REACT_APP_MONGODB_DB_NAME)
    console.log({ db })

    const col = await db.collection(process.env.REACT_APP_MONGODB_COL_NAME)

    const findRes = await col.find({ id: parseInt(id) })
    const records = await findRes.toArray()
    console.log({ records })

      // Create record
      const filter = { id }
      const update = {
        $set: {
          flashCards: {
            cards: [...req.query.cards]
          }
        }
      }
      const options = { upsert: true }

      const createRes = await col.updateOne(filter, update, options)
      console.log({ createRes })
    
  //   if(records.length > 0)
  //   {
  //     console.log("ID found", req.query.id)
  //     col.updateOne({id: parseInt(req.query.id)}, {$set: {flashCards: {cards: req.query.cards}}}).then((response2, err2) =>
  //     {
  //       if(err2)
  //       {
  //         console.log('ERROR:', err2)
  //         client.close()
  //       }else{
  //         console.log('SUCCESS:', response2, )
  //         client.close()
  //       }
  //       res.status(200).send(records)
  //     })
  //   }else {
  //     console.log("id not found", req.query, results)
  //     res.status(200).send(records)
  //   }
    
  //   console.log({ res })
    return(createRes)
  } catch (err) {
    console.log(err)
  }
  // })
  // res.status(200)
})

app.listen(process.env.REACT_APP_SERVER_PORT || port)

console.log('listening on port', process.env.REACT_APP_SERVER_PORT || port)

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}
