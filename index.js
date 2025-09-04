const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json());
app.use("/tag", express.static(path.join(__dirname, "public/tag")));
// PostgreSQL connection string
const pool = new Pool({
  connectionString: process.env.db,
  // ssl: { rejectUnauthorized: false }, // Uncomment if Supabase requires SSL
});

const restaurantTags = [
  { label: "Rice", icon: "/tags/rice.svg" },
  { label: "Chicken", icon: "/tags/chicken.svg" },
  { label: "Shawarma", icon: "/tags/shawarma.svg" },
  { label: "Juice", icon: "/tags/juice.svg" },
  { label: "Goat Meat", icon: "/tags/goatmeat.svg" },
  { label: "Fast Food", icon: "/tags/fastfood.svg" },
  { label: "Amala", icon: "/tags/amala.svg" },
  { label: "Soup Bowl", icon: "/tags/soupbowl.svg" },
  { label: "Turkey", icon: "/tags/turkey.svg" },
  { label: "Grills", icon: "/tags/grills.svg" },
  { label: "Grocery", icon: "/tags/grocery.svg" },
  { label: "Doughnuts", icon: "/tags/doughnut.svg" },
  { label: "Smothies", icon: "/tags/smothies.svg" },
  { label: "Vegetable", icon: "/tags/vegetable.svg" },
  { label: "Ice Cream", icon: "/tags/icecream.svg" },
  { label: "Pizza", icon: "/tags/pizza.svg" },
  { label: "Native Corner", icon: "/tags/nativecorner.svg" },
  { label: "SandWish", icon: "/tags/sandwish.svg" },
  { label: "Snacks", icon: "/tags/snacks.svg" },
  { label: "Burger", icon: "/tags/burger.svg" },
  { label: "Parfait", icon: "/tags/parfait.svg" },
  { label: "Chinese", icon: "/tags/chinese.svg" },
  { label: "Ewa Agoyin", icon: "/tags/ewaagoyin.svg" },
  { label: "Pastries", icon: "/tags/pastries.svg" },
  { label: "Cup Cakes", icon: "/tags/cupcake.svg" },
  { label: "Salad", icon: "/tags/salad.svg" },
  { label: "Small Chops", icon: "/tags/smallchops.svg" },
  { label: "Sea food", icon: "/tags/seafood.svg" },
  { label: "Peppersoup", icon: "/tags/peppersoup.svg" },
  { label: "fries", icon: "/tags/fries.svg" },
  { label: "Smoothies", icon: "/tags/smoothes.svg" },
  { label: "Yoghurt", icon: "/tags/yohurt.svg" },
  { label: "Abacha", icon: "/tags/abacha.svg" }
];

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

const restaurantDemoData = [{"name":"AVO Cuisine","tag":["Rice","Chicken","Shawarma"],"img":"https://firebasestorage.googleapis.com/v0/b/heyfood-558b4.appspot.com/o/vendor_images%2FWhatsApp%20Image%202025-08-09%20at%208_211x211_yBbKL3i82iqwbuseq8eB4.jpg?alt=media&token=d68a7712-255c-42d1-b3a9-54b1b9940a32","stars":"0","rating":"5","open_time":"2010-08-18T08:00:00.000Z","close_time":"2010-08-18T21:00:00.000Z","tag_id":null,"discount":null,"genre":null},{"name":"Chibest Restaurants","tag":["Native corner"],"img":"https://firebasestorage.googleapis.com/v0/b/heyfood-558b4.appspot.com/o/vendor_images%2Fchibest%20logo_225x225_Z7p-SQ6SLaJWfkfEt_xjA.jpg?alt=media&token=257fda7f-8d09-444a-9f3e-da025326ede4","stars":"1","rating":"1.5","open_time":"2010-08-18T08:00:00.000Z","close_time":"2025-06-10T22:00:00.000Z","tag_id":null,"discount":null,"genre":null},{"name":"AFOBITES","tag":["Rice","Chicken","Shawarma"],"img":"https://firebasestorage.googleapis.com/v0/b/heyfood-558b4.appspot.com/o/vendor_images%2Fafobite%20logo_500x500_bISks6fZ0edC0NiEh0lIl.jpg?alt=media&token=404daf9d-ae50-4f6f-a52d-4f9c3a035ad6","stars":"11","rating":"4.863636363636363","open_time":"2010-08-18T07:00:00.000Z","close_time":"2010-08-18T22:00:00.000Z","tag_id":null,"discount":null,"genre":null},{"name":"Shawarma Smoothies Delight ","tag":["Shawarma"],"img":null,"stars":"4","rating":"3.625","open_time":"2010-08-18T09:00:00.000Z","close_time":"2010-08-18T21:46:00.000Z","tag_id":null,"discount":null,"genre":null},{"name":"Countryside Peppersoup","tag":["Soup bowl"],"img":"https://firebasestorage.googleapis.com/v0/b/heypay-e9f1f.appspot.com/o/food%2F87813883-67EF-4749-B49F-63A9F90C0872_500x501.jpg?alt=media&token=f59ac43a-5282-4c38-894a-92e2095d89f6","stars":"143","rating":"4.283216783216785","open_time":"2010-08-18T07:00:00.000Z","close_time":"2010-08-18T22:00:00.000Z","tag_id":null,"discount":null,"genre":null},{"name":"Iya kemi food orogun express","tag":["Rice","Amala "],"img":null,"stars":"0","rating":"5","open_time":"2010-08-18T08:00:00.000Z","close_time":"2025-09-04T19:00:00.000Z","tag_id":null,"discount":null,"genre":null},{"name":"Kamals Special","tag":["Shawarma","Burger"],"img":"https://firebasestorage.googleapis.com/v0/b/heyfood-558b4.appspot.com/o/vendor_images%2Fkamals%20logo_184x184_n-GFkOUInEzNPK6EqWhLu.jpg?alt=media&token=e0a307d2-cb66-43ae-85d3-5738fe3d2253","stars":"0","rating":"5","open_time":"2010-08-18T10:00:00.000Z","close_time":"2010-08-18T20:30:00.000Z","tag_id":null,"discount":null,"genre":null},{"name":"Anny Delicious Delights","tag":["Snacks "],"img":null,"stars":"0","rating":"5","open_time":"2010-08-18T08:00:00.000Z","close_time":"2010-08-18T20:00:00.000Z","tag_id":null,"discount":null,"genre":null},{"name":"Jays kitchen","tag":["Chicken","Turkey"],"img":"https://firebasestorage.googleapis.com/v0/b/heyfood-558b4.appspot.com/o/vendor_images%2FJays%20logo_371x371_5aXcMEGK1AHSi1GjB3-Xc.jpg?alt=media&token=d5b00613-ece6-4b07-b1b1-5331cb4f3f1a","stars":"0","rating":"5","open_time":"2010-08-17T23:00:00.000Z","close_time":"2010-08-18T17:00:00.000Z","tag_id":null,"discount":null,"genre":null},{"name":"Mursh kitchen & liquor","tag":["Shawarma","Grills"],"img":"https://firebasestorage.googleapis.com/v0/b/heyfood-558b4.appspot.com/o/vendor_images%2FAEB5BB93-1D09-40EA-B5A9-30C7C38935CE_500x500_mgJQz50ybM9UIyijMvpyO.jpg?alt=media&token=09dd9be4-ca0c-4623-8798-195f6ed01942","stars":"0","rating":"5","open_time":"2010-08-18T11:00:00.000Z","close_time":"2010-08-18T20:00:00.000Z","tag_id":null,"discount":null,"genre":null},{"name":"Westmead Farm Market","tag":["Grocery","Vegetable"],"img":"https://firebasestorage.googleapis.com/v0/b/heyfood-558b4.appspot.com/o/vendor_images%2Fwestmead%20logo_500x500_ktXmVCMJ1UTQA3kr1Deo4.jpg?alt=media&token=22f04700-fa89-4c54-b0d3-6f7eb7303fc3","stars":"0","rating":"5","open_time":"2010-08-18T08:00:00.000Z","close_time":"2010-08-18T20:00:00.000Z","tag_id":null,"discount":null,"genre":null},{"name":"Adun Labake Snacks","tag":["Snacks "],"img":"https://firebasestorage.googleapis.com/v0/b/heyfood-558b4.appspot.com/o/vendor_images%2F01409851-d145-41f2-9c1c-3f80e192ba35_260x260_ilhWpqdiyjc79gVzUZGZh.jpg?alt=media&token=ccc3c05a-5fad-4a11-8fe0-0f85f0ebb10d","stars":"0","rating":"5","open_time":"2010-08-18T08:00:00.000Z","close_time":"2010-08-18T20:00:00.000Z","tag_id":null,"discount":null,"genre":null}]
async function getOrCreateTagId(tagName) {
  try {
    const existing = await pool.query("SELECT id FROM tag WHERE name = $1", [tagName]);
    if (existing.rows.length > 0) {
      return existing.rows[0].id;
    }
    const insert = await pool.query(
      "INSERT INTO tag (name, img) VALUES ($1, $2) RETURNING id",
      [tagName, null]
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

// --- Initialize DB ---
async function initializeDB() {
  try {
    // Create tag table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tag (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE,
        img VARCHAR(255)
      );
    `);

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

for (const tag of restaurantTags) {
      await getOrCreateTag(tag.label, tag.icon);
}
    
    // 🔥 Always insert demo data (for testing)
    for (const r of restaurantDemoData) {
      const tagIds = [];
      if (Array.isArray(r.tag)) {
        for (const t of r.tag) {
          const tagId = await getOrCreateTagId(t.trim());
          tagIds.push(tagId);
        }
      }

      const inserted = await pool.query(
        `INSERT INTO restaurant 
         (name, tag, stars, rating, img, open_time, close_time, discount, tag_id, genre) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id;`,
        [
    r.name,
    JSON.stringify(r.tag || []),
    r.stars,
    r.rating,
    r.img,
    formatTime(r.open_time),   // ✅ convert to HH:MM:SS
    formatTime(r.close_time),  // ✅ convert to HH:MM:SS
    r.discount,
    JSON.stringify(tagIds),
    r.genre ? JSON.stringify(r.genre) : null
  ]
      );
      console.log(`✅ Inserted restaurant: ${r.name} (id: ${inserted.rows[0].id})`);
    }
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

// --------- SERVER STARTUP ----------

const PORT = process.env.PORT || 5000;

(async () => {
  await checkDBConnection();  // check DB first
  await initializeDB();       // initialize tables + demo data
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})();
