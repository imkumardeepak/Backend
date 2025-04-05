const express = require("express");
const { check, validationResult } = require("express-validator");
const pool = require("../Database/db");

const router = express.Router();

// Validation middleware
const batchProductionValidationRules = [
  check("batch_number", "Batch number is required").notEmpty(),
  check("product_name", "Product name is required").notEmpty(),
  check("manufacture_date", "Manufacture date must be a valid date")
    .optional()
    .isISO8601(),
  check("expiry_date", "Expiry date must be a valid date")
    .optional()
    .isISO8601(),
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

// ✅ CREATE a new batch production
router.post("/", batchProductionValidationRules, validate, async (req, res) => {
  const {
    batch_number,
    product_name,
    identification_number,
    manufacture_date,
    expiry_date,
  } = req.body;

  try {
    const newBatch = await pool.query(
      `INSERT INTO batch_production (batch_number, product_name, identification_number, manufacture_date, expiry_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        batch_number,
        product_name,
        identification_number,
        manufacture_date,
        expiry_date,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Batch production created successfully!",
      data: newBatch.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating batch production",
      error: error.message,
    });
  }
});

// ✅ GET all batch productions
router.get("/", async (req, res) => {
  try {
    const batchProductions = await pool.query("SELECT * FROM batch_production");

    res.status(200).json({
      success: true,
      message: "Batch productions retrieved successfully!",
      data: batchProductions.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching batch productions",
      error: error.message,
    });
  }
});

// ✅ GET a single batch production by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const batchProduction = await pool.query(
      `SELECT bp.*, pm.* 
       FROM batch_production bp
       JOIN product_master pm ON bp.product_name = pm.product_name
       WHERE bp.id = $1`,
      [id]
    );

    if (batchProduction.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Batch production not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Batch production retrieved successfully!",
      data: batchProduction.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching batch production",
      error: error.message,
    });
  }
});

// GET a single batch production by Identification Number
router.get("/identification/:identification_number", async (req, res) => {
  const { identification_number } = req.params;

  try {
    const batchProduction = await pool.query(
      `SELECT bp.*, pm.* 
       FROM batch_production bp
       JOIN product_master pm ON bp.product_name = pm.product_name
       WHERE bp.identification_number = $1`,
      [identification_number]
    );

    if (batchProduction.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Batch production not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Batch production retrieved successfully!",
      data: batchProduction.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching batch production",
      error: error.message,
    });
  }
});

// ✅ UPDATE a batch production by ID
router.put(
  "/:id",
  batchProductionValidationRules,
  validate,
  async (req, res) => {
    const { id } = req.params;
    const {
      batch_number,
      product_name,
      identification_number,
      manufacture_date,
      expiry_date,
    } = req.body;

    try {
      const updatedBatch = await pool.query(
        `UPDATE batch_production 
       SET batch_number = $1, product_name = $2, identification_number = $3, manufacture_date = $4, expiry_date = $5
       WHERE id = $6 RETURNING *`,
        [
          batch_number,
          product_name,
          identification_number,
          manufacture_date,
          expiry_date,
          id,
        ]
      );

      if (updatedBatch.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Batch production not found!",
        });
      }

      res.status(200).json({
        success: true,
        message: "Batch production updated successfully!",
        data: updatedBatch.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating batch production",
        error: error.message,
      });
    }
  }
);

// ✅ DELETE a batch production by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleteBatch = await pool.query(
      "DELETE FROM batch_production WHERE id = $1 RETURNING *",
      [id]
    );

    if (deleteBatch.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Batch production not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Batch production deleted successfully!",
      data: deleteBatch.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting batch production",
      error: error.message,
    });
  }
});

module.exports = router;
