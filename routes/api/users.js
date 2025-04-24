var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../../sql/config.js");
const { Strategy } = require("passport-local");

const checkUserExists = require("../../middleware/checkUserExists.js");

// Get all users
router.get("/", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.json(allUsers.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    const result = await pool.query(`
      SELECT id, username FROM users WHERE username ILIKE $1`,
      [`%${query}%`]);
    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/followUser', async (req, res) => {
  const {followerId, followedId } = req.body;
  
  try {
    await pool.query(
      `INSERT INTO 
        follows ("followerId", "followedId", "createdAt")
        VALUES ($1, $2, NOW())
        ON CONFLICT DO NOTHING
      `, [followerId, followedId]
    );
    res.status(200).json({ message: 'Follow successful'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error following user'})
  }
})

// get one user
router.get("/:userId", checkUserExists, async (req, res) => {
  //req.params contains the route parameter
  const user = req.user;

  return res.status(200).json(user);
});

// update a user
router.put("/:userId", checkUserExists, async (req, res) => {
  // BASIC, WILL CHANGE LATER
  try {
    const userId = req.params.userId;
    const user = req.user;
    let updates = req.body; // gets all fields to update

    // Remove undefined values
    updates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    // Ensure at least one field is provided
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update" });
    }

    // Hash the password if it's provided
    if ("password" in updates) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }

    // Check if email is already in use (excluding the current user)
    if ("email" in updates) {
      const result = await pool.query(
        "SELECT COUNT(*) AS count FROM users WHERE email = $1 AND id <> $2",
        [updates.email, userId]
      );

      if (parseInt(result.rows[0].count) > 0) {
        return res.status(400).json({ error: "Email is already in use" });
      }
    }

    // Dynamically build the SET clause
    const setClause = Object.keys(updates)
      .map((key, index) => `"${key}" = $${index + 1}`)
      .join(", ");

    // Get values for placeholders
    const values = Object.values(updates);
    values.push(userId); // Last placeholder for WHERE id = $n

    // Execute query
    const query = `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING *`;
    const result = await pool.query(query, values);

    res.json({ message: "Profile updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Error updating user:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// delete a user
router.delete("/:userId", checkUserExists, async (req, res) => {
  try {
    const userId = req.params.userId;
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    res.json("User was deleted!");
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
