var express = require('express');
var router = express.Router();
const db = require('../../sql/config');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    const userId = req.params.userId;
    const uploadPath = path.join(__dirname, '../../public/images/user_' + userId + '/postImages');

    fs.mkdirSync(uploadPath, { recursive: true });

    callback(null, uploadPath);
  },
  filename: function (req, file, callback) {
    let ext = path.extname(file.originalname);
    if (!ext) {
      ext = '.' + mime.extension(file.mimetype);
    }
    const uniqueName = file.fieldname + '-' + Date.now() + ext;
    console.log("Saving file as:", uniqueName);
    callback(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// adding a post
router.post("/submitFeedPost/:userId", upload.single('media'), async (req, res) => {
    const { userId } = req.params;
    const { caption, mediaType } = req.body;
    //const imagePaths = req.files ? req.files.map(file => file.path.replace('public', '')) : [];
    const file = req.file;
    console.log('Received:', caption, userId);
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.'});
    }

    const mediaUrl = `images/user_${userId}/postImages/${file.filename}`;

  try {
    const query = {
        text: 'INSERT INTO post (body, "userId", created_at) VALUES ($1, $2, NOW()) RETURNING *',
        values: [caption, userId],
    };
    const postResult = await db.query(query);
    const postId = postResult.rows[0].id;

    const queryMedia = {
      text: 'INSERT INTO post_media ("postId", "imageUrl", "media_type", created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      values: [postId, mediaUrl, mediaType],
    };
    const result = await db.query(queryMedia);
    console.log('Post added:', result.rows[0])
    res.status(200).json({ message: 'Upload successful' });
    //res.redirect('/feed')
  } catch (err) {
    console.log(err.message);
  }
});

router.get('/getPosts/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
      const posts = await db.query(
        `SELECT 
            post.id,
            post.body AS caption,
            post."userId",
            post.created_at AS timestamp,
            post_media."imageUrl" AS uri,
            post_media."media_type" AS type,
            users.username
          FROM post
          JOIN post_media ON post.id = post_media."postId"
          JOIN users ON post."userId" = users.id
          JOIN follows ON follows."followedId" = post."userId"
          WHERE follows."followerId" = $1
          ORDER BY post.created_at DESC
          `, [userId]
      )
      res.status(200).json(posts.rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error while fetching feed' });
  }
});

module.exports = router;
