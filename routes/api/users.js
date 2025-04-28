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
    const result = await pool.query(
      `
      SELECT id, username FROM users WHERE username ILIKE $1`,
      [`%${query}%`]
    );
    console.log(result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/followUser", async (req, res) => {
  const { followerId, followedId } = req.body;

  try {
    await pool.query(
      `INSERT INTO 
        follows ("followerId", "followedId", "createdAt")
        VALUES ($1, $2, NOW())
        ON CONFLICT DO NOTHING
      `,
      [followerId, followedId]
    );
    res.status(200).json({ message: "Follow successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error following user" });
  }
});

router.post("/unfollowUser", async (req, res) => {
  const { followerId, followedId } = req.body;

  try {
    await pool.query(
      `DELETE FROM follows 
       WHERE "followerId" = $1 
       AND "followedId" = $2
      `,
      [followerId, followedId]
    );
    res.status(200).json({ message: "Unollow successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error unfollowing user" });
  }
});

// get one user
router.get("/:userId", checkUserExists, async (req, res) => {
  //req.params contains the route parameter
  const user = req.user;

  return res.status(200).json(user);
});

// update a user
router.put("/:userId", checkUserExists, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = req.user;
    const email = req.body.email?.toLowerCase();
    const username = req.body.username?.toLowerCase();

    if (!username || !email) {
      return res.status(400).json({ message: "Missing fields." });
    }

    let emailTaken = false;
    let usernameTaken = false;

    // check if email is already used
    try {
      const emailResult = await pool.query(
        "SELECT COUNT(*) AS count FROM users WHERE LOWER(email) = LOWER($1) AND id != $2",
        [email, userId]
      );
      emailTaken = parseInt(emailResult.rows[0].count) > 0;
    } catch (error) {
      console.log(error.message);
      return res
        .status(500)
        .json({ message: "Database error during email check." });
    }

    // check if username is already used
    try {
      const usernameResult = await pool.query(
        "SELECT COUNT(*) AS count FROM users WHERE LOWER(username) = LOWER($1) AND id != $2",
        [username, userId]
      );
      usernameTaken = parseInt(usernameResult.rows[0].count) > 0;
    } catch (error) {
      console.log(error.message);
      return res
        .status(500)
        .json({ message: "Database error during username check." });
    }

    if (emailTaken && usernameTaken) {
      return res
        .status(400)
        .json({ message: "Email and username are already in use." });
    } else if (emailTaken) {
      return res.status(400).json({ message: "Email is already in use." });
    } else if (usernameTaken) {
      return res.status(400).json({ message: "Username is already in use." });
    }

    // update values
    const updateUser = await pool.query(
      `UPDATE users SET email = $1, username = $2 WHERE id = $3 RETURNING *`,
      [email, username, userId]
    );

    res.json({
      message: "Profile updated successfully",
      user: updateUser.rows[0],
    });
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
