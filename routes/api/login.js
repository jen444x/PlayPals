var express = require("express");
const pool = require("../../sql/config.js");
const bcrypt = require("bcrypt");
var router = express.Router();

const saltRounds = 10;

router.post("/", async (req, res) => {
  const email = req.body.email;
  const loginPassword = req.body.password;

  // check if all field were entered
  if (!email || !loginPassword) {
    return res.status(400).json({ message: "Missing fields." });
  }

  try {
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
        // console.log(result);
        return res.status(200).json({ message: "logged in" });
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

module.exports = router;
