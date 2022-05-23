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