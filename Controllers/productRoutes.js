const express = require("express");
const multer = require("multer");
const pool = require("../Database/db");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store images in memory

// ✅ CREATE a new product (with image upload)
router.post(
  "/",
  upload.fields([
    { name: "product_image" },
    { name: "cautionary_symbol_image" },
    { name: "product_instruction_image" },
  ]),
  async (req, res) => {
    const {
      product_name,
      registration_number,
      manufactured_by,
      antidotes_statement,
      marked_by,
      customer_care_details,
      gstin,
    } = req.body;

    const product_image = req.files["product_image"]
      ? req.files["product_image"][0].buffer
      : null;
    const cautionary_symbol_image = req.files["cautionary_symbol_image"]
      ? req.files["cautionary_symbol_image"][0].buffer
      : null;
    const product_instruction_image = req.files["product_instruction_image"]
      ? req.files["product_instruction_image"][0].buffer
      : null;

    try {
      const newProduct = await pool.query(
        `INSERT INTO product_master 
        (product_name, product_image, registration_number, manufactured_by, cautionary_symbol_image, antidotes_statement, marked_by, customer_care_details, gstin, product_instruction_image) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          product_name,
          product_image,
          registration_number,
          manufactured_by,
          cautionary_symbol_image,
          antidotes_statement,
          marked_by,
          customer_care_details,
          gstin,
          product_instruction_image,
        ]
      );

      res.status(201).json({
        success: true,
        message: "Product created successfully!",
        data: newProduct.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating product",
        error: error.message,
      });
    }
  }
);

// ✅ GET all products (convert binary images to base64)
router.get("/", async (req, res) => {
  try {
    const products = await pool.query("SELECT * FROM product_master");
    const formattedProducts = products.rows.map((product) => ({
      ...product,
      product_image: product.product_image
        ? product.product_image.toString("base64")
        : null,
      cautionary_symbol_image: product.cautionary_symbol_image
        ? product.cautionary_symbol_image.toString("base64")
        : null,
      product_instruction_image: product.product_instruction_image
        ? product.product_instruction_image.toString("base64")
        : null,
    }));

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully!",
      data: formattedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

// ✅ GET a single product by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await pool.query(
      "SELECT * FROM product_master WHERE id = $1",
      [id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    const formattedProduct = {
      ...product.rows[0],
      product_image: product.rows[0].product_image
        ? product.rows[0].product_image.toString("base64")
        : null,
      cautionary_symbol_image: product.rows[0].cautionary_symbol_image
        ? product.rows[0].cautionary_symbol_image.toString("base64")
        : null,
      product_instruction_image: product.rows[0].product_instruction_image
        ? product.rows[0].product_instruction_image.toString("base64")
        : null,
    };

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully!",
      data: formattedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
});

// ✅ UPDATE a product by ID
router.put(
  "/:id",
  upload.fields([
    { name: "product_image" },
    { name: "cautionary_symbol_image" },
    { name: "product_instruction_image" },
  ]),
  async (req, res) => {
    const { id } = req.params;
    const {
      product_name,
      registration_number,
      manufactured_by,
      antidotes_statement,
      marked_by,
      customer_care_details,
      gstin,
    } = req.body;

    const product_image = req.files["product_image"]
      ? req.files["product_image"][0].buffer
      : null;
    const cautionary_symbol_image = req.files["cautionary_symbol_image"]
      ? req.files["cautionary_symbol_image"][0].buffer
      : null;
    const product_instruction_image = req.files["product_instruction_image"]
      ? req.files["product_instruction_image"][0].buffer
      : null;

    try {
      const updatedProduct = await pool.query(
        `UPDATE product_master 
        SET product_name = $1, product_image = COALESCE($2, product_image), 
            registration_number = $3, manufactured_by = $4, 
            cautionary_symbol_image = COALESCE($5, cautionary_symbol_image),
            antidotes_statement = $6, marked_by = $7, 
            customer_care_details = $8, gstin = $9, 
            product_instruction_image = COALESCE($10, product_instruction_image)
        WHERE id = $11 RETURNING *`,
        [
          product_name,
          product_image,
          registration_number,
          manufactured_by,
          cautionary_symbol_image,
          antidotes_statement,
          marked_by,
          customer_care_details,
          gstin,
          product_instruction_image,
          id,
        ]
      );

      if (updatedProduct.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found!",
        });
      }

      res.status(200).json({
        success: true,
        message: "Product updated successfully!",
        data: updatedProduct.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating product",
        error: error.message,
      });
    }
  }
);

// ✅ DELETE a product by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleteProduct = await pool.query(
      "DELETE FROM product_master WHERE id = $1 RETURNING *",
      [id]
    );

    if (deleteProduct.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully!",
      data: deleteProduct.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
});

module.exports = router;
