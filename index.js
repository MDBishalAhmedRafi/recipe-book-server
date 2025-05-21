const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

//pass: 8KWaHYJ7cUP1cL0G
//user: recipe-book




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ucyzrcm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

                const recipiesCollection = client.db('coffeeDB').collection('Top-recipe')
                app.get('/recipies', async(req, res) => { 
                                // const cursor = recipiesCollection.find().sort({likeCount:1}).limit(6);
                                // const result = await cursor.toArray()

                                const result = await recipiesCollection.find().sort({likeCount:1}).limit(6).toArray();
                                res.send(result);
                                console.log(result);
                })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
//     await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => { 
                res.send('Recipies are getting Ready')
})

app.listen(port, () => { 
                console.log(`Recipe Server is running on Port ${port}`);
})