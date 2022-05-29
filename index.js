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

        app.get('/user', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });

        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolCollection.findOne(query);
            res.send(tool);
        });

        app.get('/allTool', async (req, res) => {
            const query = {};
            const cursor = toolCollection.find(query);
            const allTool = await cursor.toArray();
            res.send(allTool);
        });
        app.post('/addProduct', async (req, res) => {
            const addProduct = req.body;
            const result = await toolCollection.insertOne(addProduct);
            res.send(result);

        });



        app.delete('/allTool/:id', async (req, res) => {
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
