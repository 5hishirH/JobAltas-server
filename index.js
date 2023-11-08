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
    const ApplicationCollection = client
      .db("JobAtlasDB")
      .collection("Applications");

    app.get("/jobs", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await JobCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query1 = { _id: new ObjectId(id) };
      const result = await JobCollection.findOne(query1);
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      console.log(newJob);
      const result = await JobCollection.insertOne(newJob);
      res.send(result);
    });

    app.get("/applications", async (req, res) => {
      let query = {};
      if (req.query?.jobId && req.query?.appliedMail) {
        query = {
          $and: [
            { job_id: req.query.jobId },
            { user_email: req.query.appliedMail },
          ],
        };

        console.log(query);
        const result = await ApplicationCollection.find(query).toArray();
        console.log(result);
        if (result.length > 0) {
          res.send({
            appData: result,
            exist: true,
          });
        } else {
          res.send({
            appData: result,
            exist: false,
          });
        }
      } else if (req.query?.email) {
        query = { user_email: req.query?.email};
        const applications = await ApplicationCollection.find(query).toArray();
        const jobID = applications.map((e) => e.job_id);
        const objID = jobID.map(e => new ObjectId(e));
        const result = await JobCollection.find({ _id : {$in: objID}}).toArray();
        res.send(result);
      }
    });

    app.post("/applications", async (req, res) => {
      const newApplicant = req.body;
      console.log(newApplicant);
      const result = await ApplicationCollection.insertOne(newApplicant);
      res.send(result);
    });

    app.patch("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const theDocument = await JobCollection.findOne(filter);
      let applyNo = parseInt(theDocument.applicantNumber);
      applyNo = applyNo + 1;
      applyNo = applyNo.toString();
      console.log(applyNo);
      const updateDoc = {
        $set: {
          applicantNumber: applyNo,
        },
      };
      const result = await JobCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.put("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedJobs = req.body;

      const job = {
        $set: updatedJobs,
      };

      const result = await JobCollection.updateOne(filter, job, options);
      res.send(result);
    });

    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await JobCollection.deleteOne(query);
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
