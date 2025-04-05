const express = require("express");
const { check, validationResult } = require("express-validator");
const pool = require("../Database/db");

const router = express.Router();

// Validation middleware for access_logs
const accessLogsValidationRules = [
  check("batch_number", "Batch number is required").notEmpty().isString(),
  check("product_name", "Product name is required").notEmpty().isString(),
  check("latitude", "Latitude must be a valid number")
    .isFloat({ min: -90, max: 90 })
    .notEmpty(),
  check("longitude", "Longitude must be a valid number")
    .isFloat({ min: -180, max: 180 })
    .notEmpty(),
  check("address", "Address is required").notEmpty().isString(),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: extractedErrors,
  });
};

// ✅ CREATE a new access log entry
router.post("/", accessLogsValidationRules, validate, async (req, res) => {
  const { batch_number, product_name, latitude, longitude, address } = req.body;

  try {
    const newAccessLog = await pool.query(
      `INSERT INTO access_logs (batch_number, product_name, latitude, longitude, address) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [batch_number, product_name, latitude, longitude, address]
    );

    res.status(201).json({
      success: true,
      message: "Access log created successfully!",
      data: newAccessLog.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating access log",
      error: error.message,
    });
  }
});

// ✅ GET all access logs
router.get("/", async (req, res) => {
  try {
    const accessLogs = await pool.query("SELECT * FROM access_logs");

    res.status(200).json({
      success: true,
      message: "Access logs retrieved successfully!",
      data: accessLogs.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching access logs",
      error: error.message,
    });
  }
});

// ✅ GET a single access log by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const accessLog = await pool.query(
      "SELECT * FROM access_logs WHERE id = $1",
      [id]
    );

    if (accessLog.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Access log not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Access log retrieved successfully!",
      data: accessLog.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching access log",
      error: error.message,
    });
  }
});

// ✅ UPDATE an access log by ID
router.put("/:id", accessLogsValidationRules, validate, async (req, res) => {
  const { id } = req.params;
  const { batch_number, product_name, latitude, longitude, address } = req.body;

  try {
    const updatedAccessLog = await pool.query(
      `UPDATE access_logs 
       SET batch_number = $1, product_name = $2, latitude = $3, longitude = $4, address = $5
       WHERE id = $6 RETURNING *`,
      [batch_number, product_name, latitude, longitude, address, id]
    );

    if (updatedAccessLog.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Access log not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Access log updated successfully!",
      data: updatedAccessLog.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating access log",
      error: error.message,
    });
  }
});

// ✅ DELETE an access log by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAccessLog = await pool.query(
      "DELETE FROM access_logs WHERE id = $1 RETURNING *",
      [id]
    );

    if (deletedAccessLog.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Access log not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Access log deleted successfully!",
      data: deletedAccessLog.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting access log",
      error: error.message,
    });
  }
});

module.exports = router;
