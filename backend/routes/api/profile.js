var express = require("express");
var router = express.Router();
const db = require("../../sql/config");
const multer = require("multer");
const path = require("path");
const { readdir } = require("fs");
const fs = require("fs");
const mime = require("mime-types");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const userId = req.params.userId;
    const uploadPath = path.join(
      __dirname,
      "../../public/images/user_" + userId + "/avatars/users/"
    );

    fs.mkdirSync(uploadPath, { recursive: true });

    callback(null, uploadPath);
  },
  filename: function (req, file, callback) {
    let ext = path.extname(file.originalname);
    if (!ext) {
      ext = "." + mime.extension(file.mimetype);
    }
    const uniqueName = "user-" + "-" + Date.now() + ext;
    console.log("Saving image as:", uniqueName);
    callback(null, uniqueName);
  },
});

const uploadUserAvatar = multer({ storage: storage });

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { viewerId } = req.query;

  try {
    // Fetching profile info
    const userProfile = await db.query(
      `
          SELECT 
            u.id,
            u.username,
            u.bio,
            u.avatar,
            COALESCE(followers.count, 0) AS followers,
            COALESCE(following.count, 0) AS following,
            COALESCE(post_likes.total_likes, 0) AS likes
          FROM users u
          LEFT JOIN (
            SELECT "followedId", COUNT(*) as count
            FROM follows
            GROUP BY "followedId"
          ) followers ON followers."followedId" = u.id
          LEFT JOIN (
            SELECT "followerId", COUNT(*) as count
            FROM follows
            GROUP BY "followerId"
          ) following ON following."followerId" = u.id
          LEFT JOIN (
            SELECT p."userId", COUNT(pl."postId") as total_likes
            FROM post p
            LEFT JOIN "postLikes" pl ON pl."postId" = p.id
            GROUP BY p."userId"
          ) post_likes ON post_likes."userId" = u.id
          WHERE u.id = $1
          `,
      [userId]
    );

    const posts = await db.query(
      `
          SELECT 
            pm.id,
            pm."imageUrl" AS image,
            pm."media_type",
            pm."created_at"
          FROM post_media pm
          JOIN post p ON pm."postId" = p.id
          WHERE p."userId" = $1
          ORDER BY pm."created_at" DESC
          `,
      [userId]
    );

    if (userProfile.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userProfile.rows[0];

    let isFollowing = false;

    if (viewerId) {
      const followResult = await db.query(
        `
            SELECT EXISTS (
              SELECT 1
              FROM follows
              WHERE "followerId" = $1 AND "followedId" = $2
            ) AS "isFollowing"
            `,
        [viewerId, userId]
      );
      isFollowing = followResult.rows[0].isFollowing;
    }

    res.json({
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      stats: {
        followers: Number(user.followers),
        following: Number(user.following),
        likes: Number(user.likes),
      },
      posts: posts.rows,
      isFollowing: isFollowing,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

router.put("/updateBio/:userId", async (req, res) => {
  const { userId } = req.params;
  const { bio } = req.body;

  try {
    await db.query(`UPDATE "users" SET "bio" = $1 WHERE "id" = $2`, [
      bio,
      userId,
    ]);
    res.status(200).json({ message: "Bio updated successfully" });
  } catch (error) {
    console.error("Error updating bio:", error);
    res.status(500).json({ error: "Failed to update bio" });
  }
});

// Upload user avatar image
router.post(
  "/:userId/uploadAvatar",
  uploadUserAvatar.single("avatar"),
  async (req, res) => {
    const userId = req.params.userId;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const avatarPath = `images/user_${userId}/avatars/users/${req.file.filename}`;

    try {
      const result = await db.query(
        `UPDATE users SET 
      "avatar" = $1 WHERE "id" = $2
      RETURNING *`,
        [avatarPath, userId]
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ message: "User not found/unauthorized." });
      }

      res.status(200).json({ avatar: avatarPath });
    } catch (error) {
      console.error("Errpr uploading avatar:", error.message);
      res
        .status(500)
        .json({ message: "Server error while uploadaing avatar." });
    }
  }
);

module.exports = router;
