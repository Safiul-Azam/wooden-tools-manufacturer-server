const express = require('express');
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
require('dotenv').config()


//MIDDLE WARE
app.use(cors())
app.use(express.json())
//DATABASE SETUP
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cidn6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//FUNCTION FOR API 
async function run(){
    try{
        await client.connect()
        const handToolsCollection = client.db("woodenToolsManufacturer").collection("handTools")
        const usersCollection = client.db("woodenToolsManufacturer").collection("users")
        const orderCollection = client.db("woodenToolsManufacturer").collection("order")

        //  HAND TOOLS COLLECTION API
        app.get('/handTools', async(req, res)=>{
            const tools = await handToolsCollection.find().toArray()
            res.send(tools)
        })
        app.get('/handTools/:id', async(req, res)=>{
            const id = req.params.id 
            const query = {_id:ObjectId(id)}
            const result = await handToolsCollection.findOne(query)
            res.send(result)
        })
        //USER COLLECTION API
        app.put('/users/:email', async(req, res)=>{
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })
        // ORDER COLLECTION API
        app.post('/order',async(req, res)=>{
            const order = req.body 
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })
    }finally{

    }
}
run().catch(console.dir)
app.get('/',(req, res)=>{
    res.send('running wooden working tools site')
})
app.listen(port, ()=>{
    console.log("listing",port)
})