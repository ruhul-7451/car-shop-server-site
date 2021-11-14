const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jwfat.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db("carBazar");
        const carsCollection = database.collection("cars");
        const reviewsCollection = database.collection("reviews");
        const bookingsCollection = database.collection("bookings");
        const usersCollection = database.collection("users");
        const messagesCollection = database.collection("messages");

        //add user
        app.post('/users', async (req, res) => {
            const doc = req.body
            const result = await usersCollection.insertOne(doc);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        });

        //google login user
        app.put('/users', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
            res.send(result);
        });

        //make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
            res.send(result);
        });

        //get admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // create a document to insert
        app.post('/cars', async (req, res) => {
            const doc = req.body;
            const result = await carsCollection.insertOne(doc);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        })

        // get a document
        app.get('/cars', async (req, res) => {
            const query = {};
            const cursor = carsCollection.find(query);
            if ((await cursor.count()) === 0) {
                console.log("No documents found!");
                res.send("No data Found");
            }
            const result = await cursor.toArray();
            res.send(result);
        });

        //get single item from a document by id
        app.get('/showCar/:carId', async (req, res) => {
            const id = req.params.carId
            const query = { _id: ObjectId(id) };
            const result = await carsCollection.findOne(query);
            res.json(result);
        });

        //deleteCar
        app.delete('/cars/find/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await carsCollection.deleteOne(query);
            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }
            res.json(result)
        })

        //post a review
        app.post('/reviews', async (req, res) => {
            const doc = req.body
            const result = await reviewsCollection.insertOne(doc);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        });

        //get review
        app.get('/reviews', async (req, res) => {
            const query = {}
            const cursor = reviewsCollection.find(query);
            if ((await cursor.count()) === 0) {
                console.log("No documents found!");
                res.send("No data Found");
            }
            const result = await cursor.toArray();
            res.send(result);
        });

        //post a message
        app.post('/messages', async (req, res) => {
            const doc = req.body
            const result = await messagesCollection.insertOne(doc);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        });

        //get message
        app.get('/messages', async (req, res) => {
            const query = {}
            const cursor = messagesCollection.find(query);
            if ((await cursor.count()) === 0) {
                console.log("No documents found!");
                res.send("No data Found");
            }
            const result = await cursor.toArray();
            res.send(result);
        });

        //add booking
        app.post('/bookings', async (req, res) => {
            const doc = req.body;
            const result = await bookingsCollection.insertOne(doc);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        });

        //get all the bookings
        app.get('/bookings', async (req, res) => {
            const query = {}
            const cursor = bookingsCollection.find(query);
            const bookings = await cursor.toArray();
            res.json(bookings);
        });

        //get only users booking
        app.get('/bookings/search', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = bookingsCollection.find(query);
            const bookings = await cursor.toArray();
            if ((cursor.count()) === 0) {
                console.log("No documents found!");
                res.json("No data Found");
            }
            res.json(bookings);
        });

        //get bookings by id
        app.get('/bookings/find/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cursor = bookingsCollection.find(query);
            const bookings = await cursor.toArray();
            if ((cursor.count()) === 0) {
                console.log("No documents found!");
                res.json("No data Found");
            }
            res.json(bookings);
        });

        //delete bookings by id
        app.delete('/bookings/find/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }
            res.json(result)
        })

        //update booking status
        app.put('/bookings/find/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "confirmed"
                },
            };
            const result = await bookingsCollection.updateOne(filter, updateDoc, options);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
            res.json(result)
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('A Car Bazar Mongodb Atlas Server!')
})

app.listen(port, () => {
    console.log(`Server is running on Local Host:${port}`)
})