const pool = require("./Database/db");

const createProductTable = async () => {
  const query = `
        CREATE TABLE IF NOT EXISTS product_master (
            id SERIAL PRIMARY KEY,
            product_name VARCHAR(255) NOT NULL,
            product_image BYTEA, -- Store binary image data
            registration_number VARCHAR(100) UNIQUE NOT NULL,
            manufactured_by VARCHAR(255) NOT NULL,
            cautionary_symbol_image BYTEA, -- Binary cautionary symbol image
            antidotes_statement TEXT,
            marked_by VARCHAR(255),
            customer_care_details TEXT,
            gstin VARCHAR(50),
            product_instruction_image BYTEA, -- Binary instruction image
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_product_name ON product_master(product_name);
    `;
  try {
    await pool.query(query);
    console.log("Product Master table with Binary Images created ✅");
  } catch (error) {
    console.error("Error creating Product Master table ❌", error);
  }
};

const createBatchProductionTable = async () => {
  const query = `
        CREATE TABLE IF NOT EXISTS batch_production (
            id SERIAL PRIMARY KEY,
            batch_number VARCHAR(255) NOT NULL,
            product_name VARCHAR(255) NOT NULL,
            identification_number VARCHAR(255),
            manufacture_date DATE,
            expiry_date DATE
        );
    `;
  try {
    await pool.query(query);
    console.log("Batch Production table created ✅");
  } catch (error) {
    console.error("Error creating Batch Production table ❌", error);
  }
};

const createAccessLogsTable = async () => {
  const query = `
        CREATE TABLE IF NOT EXISTS access_logs (
            id SERIAL PRIMARY KEY,
            batch_number VARCHAR(255),
            product_name VARCHAR(255),
            latitude DECIMAL(10, 8), -- Stores latitude with high precision
            longitude DECIMAL(11, 8), -- Stores longitude with high precision
            address VARCHAR(255), -- Stores the human-readable location name
            accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- When the access occurred
        );
    `;
  try {
    await pool.query(query);
    console.log("Access Logs table created ✅");
  } catch (error) {
    console.error("Error creating Access Logs table ❌", error);
  }
};

createProductTable();
createBatchProductionTable();
createAccessLogsTable();
