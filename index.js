const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  credentials:true,
  origin:[
    'https://management-platform-d720b.web.app',
    'https://management-platform-d720b.firebaseapp.com',
    'http://localhost:5173'
  ]
}));
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4kezvwg.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const todoCollection = client.db("todoDB").collection("tasks");
    // task api
    // update
    app.put("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const tasks = req.body;
      console.log(tasks);
      const query = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          title: tasks.title,
          priority: tasks.priority,
          deadline: tasks.deadline,
          description: tasks.description,
        },
      };
      const result = await todoCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    // tasks post
    app.post('/tasks', async (req, res) => {
        const task = req.body;
        const result = await todoCollection.insertOne(task);
        res.send(result);
    });
    // tasks get
    app.get('/tasks', async(req, res) =>{
        const result = await todoCollection.find().toArray()
        res.send(result);
    });

    app.delete('/tasks/:id', async (req, res) => { 
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = todoCollection.deleteOne(query);
        res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) =>{
    res.send('todos is running')
});

app.listen(port, () =>{
    console.log(`Todos is running on port ${port}`);
});