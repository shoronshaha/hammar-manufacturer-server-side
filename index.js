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

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eldb7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const toolCollection = client.db('manufacturer').collection('tools');
        const testimonialCollection = client.db('manufacturer').collection('testimonial');
        const userCollection = client.db('manufacturer').collection('users')
        const orderCollection = client.db('manufacturer').collection('orders')
        const userOrderCollection = client.db('manufacturer').collection('userOrders')



        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                next();
            }
            else {
                res.status(403).send({ message: 'forbidden' });
            }
        }

        app.get('/tool', async (req, res) => {
            const query = {};
            const cursor = toolCollection.find(query).sort({ _id: -1 }).limit(6);
            const tools = await cursor.toArray();
            res.send(tools);
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


        app.delete('/allTool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toolCollection.deleteOne(query);
            res.send(result);
        });

        // user
        app.get("/user", verifyJWT, verifyAdmin, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.headers.email;
            if (email === decodedEmail) {
                const users = await userCollection.find({}).toArray();
                res.send(users);
            } else {
                res.send("Unauthorized access");
            }
        });

        app.get("/user/:email", async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const user = await userCollection.findOne({ email: email });
            res.send(user);

        });


        app.put("/user/:email", async (req, res) => {

            const email = req.params.email;
            console.log("put", email);
            const user = req.body;
            console.log("user", user);
            const query = {
                email: email,
            };
            const options = {
                upsert: true,
            };
            const updatedDoc = {
                $set: {
                    email: user?.email,
                    role: user?.role,
                },
            };
            const result = await userCollection.updateOne(
                query,
                updatedDoc,
                options
            );
            res.send(result);

        });

        app.put("/update/user/:email", verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.headers.email;
            if (email === decodedEmail) {
                const email = req.params.email;
                const user = req.body;
                console.log("user", user);
                const query = {
                    email: email,
                };
                const options = {
                    upsert: true,
                };
                const updatedDoc = {
                    $set: {
                        displayName: user?.displayName,
                        phoneNumber: user?.phoneNumber,
                        address: user?.address,
                    },
                };
                const result = await userCollection.updateOne(
                    query,
                    updatedDoc,
                    options
                );
                res.send(result);
            } else {
                res.send("Unauthorized access");
            }
        });

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })


        app.put('/user/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


        app.post('/addProduct', async (req, res) => {
            const addProduct = req.body;
            const result = await toolCollection.insertOne(addProduct);
            res.send(result);

        });


        app.get('/orders', async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query);
            const allOrder = await cursor.toArray();
            res.send(allOrder);
        });

        app.get('/userOrder', verifyJWT, async (req, res) => {
            const user = req.query.user;
            const decodedEmail = req.decoded.email;
            if (patient === decodedEmail) {
                const query = { user: user };
                const orders = await userOrderCollection.find(query).toArray();
                return res.send(orders);
            }
            else {
                return res.status(403).send({ message: 'forbidden access' });
            }
        });



        app.post('/orders', async (req, res) => {
            const data = req.body;
            const query = {
                productId: data._id,
                productName: data.name,
                productImage: data.image,
            };
            const result = await orderCollection.insertOne(data);
            const result1 = await userOrderCollection.insertOne(data);
            res.send(result);

        })





        app.delete('/allOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
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
