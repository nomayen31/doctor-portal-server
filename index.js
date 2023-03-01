var express = require('express')
var cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port =process.env.PORT || 5000;

var app = express()

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_PASS}@cluster0.07lgbsy.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

 async function run(){
    try{
        const appointmentOptionsCollection = client.db('doctorsPortal').collection('appointmentOptions')

        const bookingsCollection =client.db('doctorsPortal').collection('bookings')

        app.get('/appointmentOptions', async(req, res)=>{
           const query ={};
            const options =await appointmentOptionsCollection.find(query).toArray();
            res.send(options);
        })

        app.post('/bookings', async(req, res)=>{
           const booking =req.body 
           console.log(booking);
           const result =await bookingsCollection.insertOne(booking)
           res.send(result);
        })
    }
    finally{

    }
 }
 run().catch(console.log())



app.get('/', async(req, res )=>{
    res.send('doctor portal server is running');
})

app.listen(port, () =>console.log(`doctors portal is running ${port}`));

