var express = require('express')
var cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const { response } = require('express');
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
        const usersCollection =client.db('doctorsPortal').collection('users')

        app.get('/appointmentOptions', async (req, res) => {
            const date = req.query.date;
            const query = {};
            const options = await appointmentOptionsCollection.find(query).toArray();

            // get the bookings of the provided date
            const bookingQuery = { appointmentDate: date }
            const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();
            
            options.forEach(option => {
                const optionBooked = alreadyBooked.filter(book => book.treatment === option.name);
                const bookedSlots = optionBooked.map(book => book.slot);
                const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
                option.slots = remainingSlots;
            })
            res.send(options);
        })

        app.get('/bookings', async(req, res)=>{
            const email =req.query.email;
            const query ={email: email};
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.post('/bookings', async(req, res)=>{
           const booking =req.body 
           console.log(booking);
           const query ={
            appointmentDate: booking.appointmentDate,
            email:booking.email,
            treatment:booking.treatment
           }

           const alreadyBooked =await bookingsCollection.find(query).toArray();

           if (alreadyBooked.length) {
            const message = `you have already booking ${booking.appointmentDate}`
            return res.send({acknowledge: false, message})
           }

           
           const result =await bookingsCollection.insertOne(booking)
           res.send(result);
        });

        app.get('/jst', async(req, res)=>{
            const email =req.email.email;
            const query ={email: email}
            const user =await usersCollection.findOne(query)
            if (user) {
                const token =jwt.sign({email}, process.env.ACESS_TOKEN,{expiresIn: '1h'})
              return res.send({accessToken:token})
            }
            console.log(user);  
            res.status(403).send({accessToken:''})
        })
      
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
    }
    finally{

    }
 }
 run().catch(console.log())



app.get('/', async(req, res )=>{
    res.send('doctor portal server is running');
})

app.listen(port, () =>console.log(`doctors portal is running ${port}`));

