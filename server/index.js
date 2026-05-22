require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const patientRoutes = require("./routes/patients");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/patient_dashboard";

app.use(cors());
app.use(express.json());

app.use("/api/patients", patientRoutes);

app.get("/health", (_, res) => res.json({ status: "ok" }));

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
