const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.JOB_ATLAS}:${process.env.JOB_PASS}@cluster0.e2ydxes.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const handleMongoDB = async () => {
  try {
    const JobCollection = client.db("JobAtlasDB").collection("Jobs");

    app.get("/jobs", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await JobCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      console.log(newJob);
      const result = await JobCollection.insertOne(newJob);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
};
handleMongoDB().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
