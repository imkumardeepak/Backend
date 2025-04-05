require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

console.log("Database connection configuration:", {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool
  .connect()
  .then((client) => {
    console.log("Connected to PostgreSQL ✅");
    client.release(); // Release the connection
  })
  .catch((err) => {
    console.error("PostgreSQL connection error ❌", err.message);
    console.error("Error details:", err);
  });

module.exports = pool;
