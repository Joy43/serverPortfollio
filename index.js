// server.js
const express = require("express");
const nodemailer = require("nodemailer");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectToMongo();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  // Setup your mail server configuration here
  service: "Gmail",
  auth: {
    user: "your_email@gmail.com",
    pass: "your_password",
  },
});

// Express route to handle form submission
app.use(express.json());

app.post("/submit-form", async (req, res) => {
  try {
    // Save form data to MongoDB
    const db = client.db("your_database");
    const formDataCollection = db.collection("form_data");
    const result = await formDataCollection.insertOne(req.body);

    // Send email to owner
    const mailOptions = {
      from: "your_email@gmail.com",
      to: "owner_email@example.com", // Owner's email address
      subject: "New form submission",
      text: JSON.stringify(req.body),
    };
    await transporter.sendMail(mailOptions);

    res.status(200).send("Form submitted successfully");
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).send("Error submitting form");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
