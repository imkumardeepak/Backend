require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const https = require("https");
const productRoutes = require("./Controllers/productRoutes");
const batchRoutes = require("./Controllers/BatchRoutes");

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

// Proxy requests to the external API (e.g., https://182.70.117.46:444)
app.use("/api/external/*", async (req, res) => {
  try {
    const externalPath = req.url.replace("/api/external", "");
    const externalUrl = `https://182.70.117.46:444${externalPath}`;
    const response = await axiosInstance({
      method: req.method,
      url: externalUrl,
      data: req.body, // Forward request body for POST/PUT
      headers: {
        ...req.headers,
        host: "182.70.117.46", // Set correct host
      },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
    });
  }
});

// Existing routes
app.use("/api/products", productRoutes);
app.use("/api/batches", batchRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
