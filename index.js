const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection string
const pool = new Pool({
  connectionString: process.env.db,
  // ssl: { rejectUnauthorized: false }, // Uncomment if Supabase requires SSL
});

// Check DB connection
async function checkDBConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log("✅ Database connection successful!");
  } catch (err) {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1); // stop the server if DB isn't connected
  } finally {
    if (client) client.release();
  }
}

// Initialize tables + demo data
async function initializeDB() {
  try {
    // Create tag table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tag (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        img VARCHAR(255)
      );
    `);

    // Insert demo data if empty
    const tagCount = await pool.query("SELECT COUNT(*) FROM tag;");
    if (parseInt(tagCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO tag (name, img) VALUES
        ('Fast Food', 'https://example.com/fastfood.png'),
        ('Fine Dining', 'https://example.com/finedining.png'),
        ('Cafe', 'https://example.com/cafe.png');
      `);
      console.log("✅ Demo data inserted into tag table");
    }

    // Create restaurant table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurant (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200),
        tag JSON,
        stars VARCHAR(10),
        rating VARCHAR(10),
        img VARCHAR(255),
        open_time TIME,
        close_time TIME,
        discount VARCHAR(50),
        tag_id JSON,
        genre JSON
      );
    `);

    // Insert demo data if empty
    const restaurantCount = await pool.query("SELECT COUNT(*) FROM restaurant;");
    if (parseInt(restaurantCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO restaurant (name, tag, stars, rating, img, open_time, close_time, discount, tag_id, genre) VALUES
        ('Burger King', '["Fast Food"]', '4', '4.5', 'https://example.com/burgerking.png', '10:00', '22:00', '10%', '[1]', '["American"]'),
        ('Starbucks', '["Cafe"]', '5', '4.8', 'https://example.com/starbucks.png', '08:00', '20:00', '5%', '[3]', '["Coffee","Dessert"]'),
        ('Le Gourmet', '["Fine Dining"]', '5', '4.9', 'https://example.com/legourmet.png', '18:00', '23:00', '15%', '[2]', '["French","Luxury"]');
      `);
      console.log("✅ Demo data inserted into restaurant table");
    }

    console.log("✅ Database initialized successfully!");
  } catch (err) {
    console.error("❌ Error initializing DB:", err.message);
  }
}

// --------- ROUTES ----------

// Root
app.get("/", (req, res) => {
  res.json({ message: "Express + PostgreSQL with demo data!" });
});

// Get all restaurants
app.get("/restaurants", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM restaurant ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all tags
app.get("/tags", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tag ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Drop tables
app.get("/drop-tables", async (req, res) => {
  const secret = req.query.secret;
  if (secret !== "12345") {
    return res.status(403).json({ error: "❌ Forbidden: Invalid secret key" });
  }

  try {
    await pool.query("DROP TABLE IF EXISTS restaurant CASCADE;");
    await pool.query("DROP TABLE IF EXISTS tag CASCADE;");
    res.json({ message: "✅ Tables dropped successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Error dropping tables" });
  }
});

// --------- SERVER STARTUP ----------

const PORT = process.env.PORT || 5000;

(async () => {
  await checkDBConnection();  // check DB first
  await initializeDB();       // initialize tables + demo data
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})();
