require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const https = require("https");
const productRoutes = require("./Controllers/productRoutes");
const batchRoutes = require("./Controllers/BatchRoutes");
const accessLogsRoutes = require("./Controllers/accessLogs");
const app = express();
const PORT = process.env.PORT || 5000;

// Create an Axios instance to bypass SSL verification
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Bypass SSL errors for development
  }),
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Existing routes
app.use("/api/products", productRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/access-logs", accessLogsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
