const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { get } = require('express/lib/response');
const port = process.env.PORT || 5000
require('dotenv').config()


//MIDDLE WARE
app.use(cors())
app.use(express.json())




//DATABASE SETUP
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cidn6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//VERIFY JWT TOKEN AND MAINTAIN ERROR
const verifyJwt = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
    })
}


//FUNCTION FOR API 
async function run() {
    try {
        // COLLECTION LIST FROM MONGODB
        await client.connect()
        const handToolsCollection = client.db("woodenToolsManufacturer").collection("handTools")
        const usersCollection = client.db("woodenToolsManufacturer").collection("users")
        const orderCollection = client.db("woodenToolsManufacturer").collection("order")
        const reviewCollection = client.db("woodenToolsManufacturer").collection("review")

        //VERIFY ADMIN FUNCTION
        const verifyAdmin = async (req, res, next) => {
            const requesterEmail = req.decoded.email
            const requesterAccount = await usersCollection.findOne({email: requesterEmail })
            if (requesterAccount.role === 'admin') {
                next()
            } else {
                return res.status(403).send({ message: 'forbidden access' })
            }
        }

        //  HAND TOOLS COLLECTION API
        app.post('/handTools',verifyJwt,verifyAdmin,async(req, res)=>{
            const handTool = req.body 
            const result = await handToolsCollection.insertOne(handTool)
            res.send(result)
        })

        app.get('/handTools', async (req, res) => {
            const tools = await handToolsCollection.find().toArray()
            res.send(tools)
        })
        app.get('/handTools/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await handToolsCollection.findOne(query)
            res.send(result)
        })
        app.delete('/handTools/:id',verifyJwt, verifyAdmin, async(req, res)=>{
            const id = req.params.id 
            const query = {_id:ObjectId(id)}
            const result = await handToolsCollection.deleteOne(query)
            res.send(result)
        })
        //USER COLLECTION API
        //Admin api
        app.put('/users/admin/:email', verifyJwt, verifyAdmin, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)
        })
        app.get('/admin/:email', verifyJwt, async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            const isAdmin = user.role === 'admin'
            res.send({ admin: isAdmin })
        })
        // Uses api
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const jwtAccessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({ result, jwtAccessToken })
        })
        app.get('/users', verifyJwt, async (req, res) => {
            const user = await usersCollection.find().toArray()
            res.send(user)
        })
        app.get('/users/:email', verifyJwt, async (req, res) => {
            const email = req.params.email 
            const query = {email:email}
            const user = await usersCollection.findOne(query)
            res.send(user)
        })
        // ORDER COLLECTION API
        app.post('/order', async (req, res) => {
            const order = req.body
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })
        app.get('/order', verifyJwt,verifyAdmin, async (req, res) => {
            const order = await orderCollection.find().toArray()
            res.send(order)
        })
        app.get('/order/:email', verifyJwt, async (req, res) => {
            const email = req.params.email
            const decodedEmail = req.decoded.email
            if (email === decodedEmail) {
                const query = { email: email }
                const result = await orderCollection.find(query).toArray()
                return res.send(result)
            } else {
                return res.status(403).send({ message: 'forbidden access' })
            }
        })
        app.get('/order/:id',verifyJwt,async(req, res)=>{
            const id = req.params.id 
            const query = {_id:ObjectId(id)}
            const result = await orderCollection.findOne(query)
            res.send(result)

        })
        app.delete('/order/:id',verifyJwt, async(req, res)=>{
            const id = req.params.id 
            const query = {_id:ObjectId(id)}
            const result = await orderCollection.deleteOne(query)
            res.send(result)
        })
        //REVIEW COLLECTION API
        app.post('/review', verifyJwt, async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })
        app.get('/review', async (req, res) => {
            const review = await reviewCollection.find().toArray()
            res.send(review)
        })
    } finally {

    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('running wooden working tools site')
})
app.listen(port, () => {
    console.log("listing", port)
})