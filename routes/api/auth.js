var express = require("express");
const pool = require("../../sql/config.js");
const bcrypt = require("bcrypt");
var router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../../config");

const saltRounds = 10;

router.post("/registerUser", async (req, res) => {
  const username = req.body.username;
  // const username = "john";
  const email = req.body.email;
  const password = req.body.password;

  console.log(username);

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

  // check if username is already used
  try {
    const result = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE username = $1",
      [username]
    );

    if (result.rows[0].count > 0) {
      return res.status(400).json({ message: "Username is already in use." });
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

router.post("/loginUser", async (req, res) => {
  const email = req.body.email;
  const loginPassword = req.body.password;
  try {
    // check if all field were entered
    if (!email || !loginPassword) {
      return res.status(400).json({ message: "Missing fields." });
    }
    // search for user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      // if user is found, get their stored hashed pw
      const user = result.rows[0];
      const hashedPassword = user.password;
      // compare login pw to hashed pw
      if (await bcrypt.compare(loginPassword, hashedPassword)) {
        // Create JWT
        const payload = { email: email }; // must be an object
        const token = jwt.sign(payload, config.TOKEN_SECRET, {
          expiresIn: "1h",
        });

        return res
          .status(200)
          .json({ message: "logged in", token, userId: user.id });
      } else {
        // if password didn't match
        return res.status(401).json({ message: "Incorrect credentials" });
      }
    } else {
      // if user wasn't found
      return res.status(401).json({ message: "Incorrect credentials" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Error logging in." });
  }
});

// router.post('/logout', (req, res) => {
//   // No server-side action needed for stateless JWT
//   res.status(200).json({ message: 'Logged out (client cleared token)' });
// });

module.exports = router;
