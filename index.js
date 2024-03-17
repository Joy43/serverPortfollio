const express = require("express");
const nodemailer = require("nodemailer");

const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

app.use(cors());
app.use(express.json());

// MongoDB connection
const client = new MongoClient(MONGODB_URI);

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}
connectToMongo();

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Function to send email
async function sendEmail(options) {
  try {
    await transporter.sendMail(options);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Express route to handle form submission
app.post("/submit-form", async (req, res) => {
  const { email,name, subject, message } = req.body;
  console.log(email,name, subject, message);
  try {
    // Save form data to MongoDB
    const db = client.db("massage");
    const formDataCollection = db.collection("mail");
    const result = await formDataCollection.insertOne(req.body);

    // Send email to owner
    const ownerMailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: subject,
      text: JSON.stringify(req.body),
    };
    await sendEmail(ownerMailOptions);

    // Send email confirmation to user
    const userMailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Thank you for contact",
      text: `Dear ${name},\n\nThank you for contacting us. We have received your message and will get back to you as soon as possible.\n\nBest regards,\nshahsultan islam joy,\n\n +8801726606815(whatsapp),`,
    };
    await sendEmail(userMailOptions);

    res.status(200).send("Form submitted successfully");
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).send("Error submitting form");
  }
});

// Define a default route for the root path
app.get("/", (req, res) => {
  res.send("Massage sent successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
