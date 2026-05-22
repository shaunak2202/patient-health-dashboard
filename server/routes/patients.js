const express = require("express");
const axios = require("axios");
const Patient = require("../models/Patient");

const router = express.Router();
const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// POST /api/patients — create patient, get prediction, save
router.post("/", async (req, res) => {
  try {
    const { name, vitals } = req.body;
    if (!name || !vitals) return res.status(400).json({ error: "name and vitals required" });

    const { data: predictions } = await axios.post(`${ML_URL}/predict`, vitals, {
      timeout: 15000,
    });

    const patient = await Patient.create({ name, vitals, predictions });
    res.status(201).json(patient);
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    res.status(500).json({ error: detail });
  }
});

// GET /api/patients — list all patients (latest first)
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 }).limit(50);
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/:id — single patient
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/patients/:id
router.delete("/:id", async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
