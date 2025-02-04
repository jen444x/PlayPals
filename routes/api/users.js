var express = require('express');
var router = express.Router();
const sql = require('../../sql/config');

// get all users EXAMPLE, DELETE LATER
router.get("/", async (req, res) => {
  try {
    const allUsers = await sql.query("SELECT * FROM users");
    res.json(allUsers.rows);
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
