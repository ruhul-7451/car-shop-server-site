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


        // create a document to insert
        app.post('/cars', async (req, res) => {
            const doc = req.body
            console.log(doc);
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
            console.log('single hit');
            const id = req.params.carId
            const query = { _id: ObjectId(id) };
            const result = await carsCollection.findOne(query);
            res.json(result);
        });

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