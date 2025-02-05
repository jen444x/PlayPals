var express = require('express');
var router = express.Router();
const db = require('../../sql/config');

router.post("/submitFeedPost", async (req, res) => {
    const {title, body} = req.body;
    console.log('Received:', title, body);
  try {
    const query = {
        text: 'INSERT INTO post (title, body, created_at) VALUES ($1, $2, NOW()) RETURNING *',
        values: [title, body],
    };
    const result = await db.query(query);
    console.log('Post added:', result.rows[0])
    res.redirect('/feed')
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;