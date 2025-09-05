const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const restaurantTags = require("./tag.json");
const restaurantDemoData = require("./restaurant.json");
require("dotenv").config();
//const serverless = require("serverless-http");



const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
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
 
  
  async function getOrCreateTagId(tagName) {
  const normalized = normalizeTag(tagName);

  try {
    const existing = await pool.query(
      "SELECT id FROM tag WHERE LOWER(name) = $1",
      [normalized]
    );
    if (existing.rows.length > 0) return existing.rows[0].id;

    const insert = await pool.query(
      "INSERT INTO tag (name, img) VALUES ($1, $2) RETURNING id",
      [tagName.trim(), null]
    );
    return insert.rows[0].id;
  } catch (err) {
    console.error(`❌ Error creating tag "${tagName}":`, err);
    throw err;
  }
}

async function getOrCreateTag(name, img = null) {
  try {
    const result = await pool.query("SELECT id FROM tag WHERE name = $1", [name]);
    if (result.rows.length > 0) return result.rows[0].id;

    const insert = await pool.query(
      "INSERT INTO tag (name, img) VALUES ($1, $2) RETURNING id",
      [name, img]
    );
    return insert.rows[0].id;
  } catch (err) {
    console.error(`❌ Error in getOrCreateTag for "${name}":`, err.message);
    return null;
  }
}

function formatTime(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const seconds = String(d.getUTCSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
function normalizeTag(tagName) {
  return tagName.trim().toLowerCase();
}

// --- Initialize DB ---

async function initializeDB() {
  try {
    // --- Create tables ---
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tag (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE,
        img VARCHAR(255)
      );
    `);

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
        genre JSON,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // --- Insert tags from JSON only if they don't exist ---
    for (const tag of restaurantTags) {
      const exists = await pool.query("SELECT id FROM tag WHERE name = $1", [tag.name]);
      if (exists.rows.length === 0) {
        await pool.query("INSERT INTO tag (name, img) VALUES ($1, $2)", [tag.name, tag.img]);
        console.log(`✅ Inserted tag: ${tag.name}`);
      }
    }

    // --- Fetch all tags from DB to map names to ids ---
    const tagRows = await pool.query("SELECT id, name FROM tag");
    const tagMap = {};
    for (const t of tagRows.rows) {
      tagMap[t.name.trim()] = t.id;
    }

    // --- Insert restaurant demo data only if table is empty ---
    const restaurantCount = await pool.query("SELECT COUNT(*) FROM restaurant");
    if (parseInt(restaurantCount.rows[0].count) === 0) {
      for (const r of restaurantDemoData) {
        const tagIds = [];
        if (Array.isArray(r.tag)) {
          for (const t of r.tag) {
            const trimmed = t.trim();
            if (tagMap[trimmed]) tagIds.push(tagMap[trimmed]);
          }
        }

        await pool.query(
          `INSERT INTO restaurant 
           (name, tag, stars, rating, img, open_time, close_time, discount, tag_id, genre) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            r.name,
            JSON.stringify(r.tag || []),
            r.stars,
            r.rating,
            r.img,
            formatTime(r.open_time),
            formatTime(r.close_time),
            r.discount,
            JSON.stringify(tagIds),
            r.genre ? JSON.stringify(r.genre) : null
          ]
        );
        console.log(`✅ Inserted restaurant: ${r.name}`);
      }
    }

    console.log("✅ DB initialization complete.");
  } catch (err) {
    console.error("❌ Error initializing DB:", err);
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

// GET /data - fetch tags and restaurants
app.get("/data", async (req, res) => {
  try {
    const tagsResult = await pool.query("SELECT * FROM tag ORDER BY id ASC");
    const restaurantsResult = await pool.query("SELECT * FROM restaurant ORDER BY id ASC");
    let banners = ["/banners/Frame 2664.png", "/banners/Frame 1572.png", "/banners/Frame 2684 (1).png", "/banners/Survey banner.png", "/banners/Frame 1599.png"]
      
    res.json({
      tags: tagsResult.rows,
      banners: banners,
      restaurants: restaurantsResult.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching data:", err);
    res.status(500).json({ error: "Database error" });
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
//module.exports = serverless(app);
