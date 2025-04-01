var express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../../sql/config.js");
var router = express.Router();

const saltRounds = 10; // # of times pw will have salt added

router.post("/", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  // check if all field were entered
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing fields." });
  }

  // check if email is already used
  try {
    const result = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE email = $1",
      [email]
    );

    if (result.rows[0].count > 0) {
      return res.status(400).json({ message: "Email is already in use." });
    }
  } catch (error) {
    console.log(error.message);
  }

  try {
    // hash password (text to be hashed, salt rounds)
    const hash = await bcrypt.hash(password, saltRounds);

    // create user
    newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hash]
    );

    return res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Error creating user." });
  }
});

module.exports = router;
