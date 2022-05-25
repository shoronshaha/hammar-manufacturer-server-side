const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000

//middle ware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eldb7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const toolCollection = client.db('manufacturer').collection('tools');
        const testimonialCollection = client.db('manufacturer').collection('testimonial');
        const userCollection = client.db('manufacturer').collection('users')

        app.get('/tool', async (req, res) => {
            const query = {};
            const cursor = toolCollection.find(query).sort({ _id: -1 }).limit(6);
            const tools = await cursor.toArray();
            res.send(tools);
        });

        app.get('/testimonial', async (req, res) => {
            const query = {};
            const cursor = testimonialCollection.find(query);
            const testimonial = await cursor.toArray();
            res.send(testimonial);
        });

        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolCollection.findOne(query);
            res.send(tool);
        });

        // store user information update and insert in mongodb
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.delete('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toolCollection.deleteOne(query);
            res.send(result);
        });





    }
    finally {

    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Tools manufacturer !')
})

app.listen(port, () => {
    console.log(`Manufacturer app listening on port ${port}`)
})
