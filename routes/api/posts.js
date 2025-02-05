var express = require('express');
var router = express.Router();
const db = require('../../sql/config');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './public/images');
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// adding a post
router.post("/submitFeedPost", upload.array('image', 5), async (req, res) => {
    const {title, body} = req.body;
    const imagePath = req.file ? req.file.path : [];
    console.log('Received:', title, body);
  try {
    const query = {
        text: 'INSERT INTO post (title, body, images, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        values: [title, body, imagePath],
    };
    const result = await db.query(query);
    console.log('Post added:', result.rows[0])
    res.redirect('/feed')
  } catch (err) {
    console.log(err.message);
  }
});

router.get('/getPosts', async (req, res) => {
    try {
        const posts = await db.query('SELECT * FROM post ORDER BY created_at DESC')
        res.render('feed', {posts: posts.rows})
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
