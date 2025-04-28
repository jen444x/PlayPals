var express = require('express');
var router = express.Router();
const db = require('../../sql/config');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { readdir } = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const chatId = req.params.chatId;
    const uploadPath = path.join(__dirname, '../../public/images/chats', chatId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({ storage: storage });

router.post('/uploadMedia/:chatId', upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = `images/chats/${req.params.chatId}/${req.file.filename}`;

    res.status(200).json({
      message: 'Media uploaded successfully',
      mediaUrl: `${filePath}`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error during upload." });
  }
});

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const result = await db.query(`
        SELECT 
          ci."chatID",
          u."username" AS "chatUser",
          u."id" AS "userId"
        FROM "chatUsers" cu
        JOIN "chatInfo" ci ON cu."chatID" = ci."chatID"
        JOIN "chatUsers" otherCu ON cu."chatID" = otherCu."chatID" AND otherCu."userID" != $1
        JOIN "users" u ON u."id" = otherCu."userID"
        WHERE cu."userID" = $1
      `, [userId]);
  
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching chats:', err);
      res.status(500).json({ error: 'Failed to fetch chats' });
    }
  });
  

router.post('/spawnChat', async (req, res) => {
    const { user1Id, user2Id} = req.body;
    console.log("User ID 1 - 2", user1Id, user2Id)

    if (!user1Id || !user2Id) {
        return res.status(400).json({ error: 'Missing user IDs'})
    }

    try {
        // Step 1: Check for an existing 1-on-1 chat
        console.log('Checking for existing chat...');
        const result = await db.query(`
            SELECT cu1."chatID"
            FROM "chatUsers" cu1
            JOIN "chatUsers" cu2 ON cu1."chatID" = cu2."chatID"
            WHERE cu1."userID" = $1 AND cu2."userID" = $2
          `, [user1Id, user2Id]);          

        console.log('Query result:', result.rows)
    
        if (result.rows.length > 0) {
          return res.json({ chatId: result.rows[0].chatID });
        }

        console.log('Creating new chat...');
    
        // Step 2: Create new chat
        const insertChat = await db.query(`
          INSERT INTO "chatInfo" DEFAULT VALUES RETURNING "chatID"
        `);
        const newChatId = insertChat.rows[0].chatID;

        console.log('New chatId:', newChatId);
        console.log('Adding users to chat...');
    
        // Step 3: Insert participants
        await db.query(`
          INSERT INTO "chatUsers" ("chatID", "userID") VALUES ($1, $2), ($1, $3)
        `, [newChatId, user1Id, user2Id]);
        
        console.log('Chat created successfully.');
    
        return res.json({ chatId: newChatId });
    
      } catch (err) {
        console.error("Chat error:", err);
        return res.status(500).json({ error: "Failed to find or create chat" });
      }

})

module.exports = router;