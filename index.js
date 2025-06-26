require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ucyzrcm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const recipesCollection = client.db('recipeDB').collection('recipies');
    const usersCollection = client.db('recipeDB').collection('users'); // optional for future use

    // POST a new recipe
    app.post('/recipies', async (req, res) => {
      const newRecipe = req.body;
      const result = await recipesCollection.insertOne(newRecipe);
      res.send(result);
    });

    // GET top 6 recipes sorted by likeCount
    app.get('/recipies', async (req, res) => {
      const result = await recipesCollection.find().sort({ likeCount: -1 }).limit(6).toArray();
      res.send(result);
    });

    // GET recipes added by a specific user
    app.get('/my-recipies/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await recipesCollection.find(query).toArray();
      res.send(result);
    });

    // GET all recipes
    app.get('/more-recipies', async (req, res) => {
      const result = await recipesCollection.find().toArray();
      res.send(result);
    });

    // GET single recipe by ID
    app.get('/more-recipies/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recipesCollection.findOne(query);
      res.send(result);
    });

    // UPDATE a recipe
    app.put('/my-recipies/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = { $set: req.body };
      const result = await recipesCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });

    // INCREMENT like count of a recipe
    app.patch('/recipies/:id', async (req, res) => {
      const id = req.params.id;
      const result = await recipesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { likeCount: 1 } }
      );
      res.send(result);
    });

    // DELETE a recipe
    app.delete('/my-recipies/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recipesCollection.deleteOne(query);
      res.send(result);
    });

    // ✅ NEW: GET STATS for total foods, user's recipes, and total users
    app.get('/stats', async (req, res) => {
      try {
        const totalRecipes = await recipesCollection.estimatedDocumentCount();
        const userEmail = req.query.email;

        let userRecipesCount = 0;
        if (userEmail) {
          userRecipesCount = await recipesCollection.countDocuments({ email: userEmail });
        }

        const totalUsers = await usersCollection.estimatedDocumentCount(); // optional

        res.send({
          totalRecipes,
          userRecipesCount,
          totalUsers,
        });
      } catch (error) {
        res.status(500).send({ message: 'Failed to fetch stats', error });
      }
    });

    console.log("Connected to MongoDB!");
  } finally {
    // Keep connection open (do not close)
  }
}

run().catch(console.dir);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Recipes API is running');
});

// Start server
app.listen(port, () => {
  console.log(`Recipe Server is running on Port ${port}`);
});
