var express = require('express');
var router = express.Router();
const db = require('../../sql/config');
const multer = require('multer');
const path = require('path');
const { readdir } = require('fs');

router.post('/submitForumThread', async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Request body is empty' });
    }
    const {topicId, title, content, userId} = req.body
    console.log("Received ", topicId, title, content)

    if (!topicId || !title || !content || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

    try {
        const insertThread = { 
        text:`INSERT INTO "forumThreads" ("topicId", "title", "content", "userId")
        VALUES ($1, $2, $3, $4) RETURNING "id"`,
        values: [topicId, title, content, userId]
        }

        const threadRes = await db.query(insertThread);
        const postThreadId = threadRes.rows[0].id;

        res.status(201).json({ message: 'Discussion created', threadId: postThreadId });
    } catch (err) {
        console.error('Error submitting forum thread:', err);
        res.status(500).json({ error: 'Failed to submit thread' });
    }
})

router.post('/submitPost', async (req, res) => {
    const {threadId, body} = req.body;
    console.log('Received: ', threadId, body)

    try {
        const query = {
            text: 'INSERT INTO "forumPosts" ("postThreadId", "postContent") VALUES ($1, $2)',
            values: [threadId, body],
        }
        const result = await db.query(query)
        return res.redirect(`/forum/thread/${threadId}`)
    } catch (err) {
        console.log(err.message);
    }
})

router.get('/getThreads', async (req, res) => {
    const { topic = 'All', page = 1 } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
        const query = `
              SELECT 
                ft."id", ft."title", ft."content",
                u."username" AS "author",
                t."name" AS "topic",
                ft."createdAt",
                (SELECT COUNT(*) FROM "forumReplies" fr WHERE fr."threadId" = ft."id") AS "replyCount",
                (SELECT fr."content" FROM "forumReplies" fr WHERE fr."threadId" = ft."id" ORDER BY fr."createdAt" ASC LIMIT 1) AS "previewReply"
              FROM "forumThreads" ft
              JOIN "forumTopics" t ON ft."topicId" = t."id"
              LEFT JOIN "users" u ON ft."userId" = u."id"
              ${topic !== 'All' ? 'WHERE t."name" = $1' : ''}
              ORDER BY ft."createdAt" DESC
              LIMIT $${topic !== 'All' ? 2 : 1} OFFSET $${topic !== 'All' ? 3 : 2}
            `;

        const values = topic !== 'All'
          ? [topic, limit, offset]
          : [limit, offset];
        
        const result = await db.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching forum threads:', err);
        res.status(500).json({ error: 'Failed to fetch threads' });
    }
});

router.get('/thread/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const threadQuery = `
          SELECT ft."id", ft."title", ft."content", u."username" AS "author"
          FROM "forumThreads" ft
          LEFT JOIN "users" u ON ft."userId" = u."id"
          WHERE ft."id" = $1
        `;
        const replyQuery = `
          SELECT fr."id", fr."content", u."username" AS "author"
          FROM "forumReplies" fr
          LEFT JOIN "users" u ON fr."userId" = u."id"
          WHERE fr."threadId" = $1
          ORDER BY fr."createdAt" ASC
        `;

        const [threadRes, repliesRes] = await Promise.all([
          db.query(threadQuery, [id]),
          db.query(replyQuery, [id])
        ]);
      
        if (threadRes.rows.length === 0) {
          return res.status(404).json({ error: 'Thread not found' });
        }
      
        const thread = threadRes.rows[0];
        thread.replies = repliesRes.rows;
      
        res.json(thread);
    } catch (err) {
        console.error('Error fetching thread:', err);
        res.status(500).json({ error: 'Failed to fetch thread' });
    }
});

router.post('/thread/:id/reply', async (req, res) => {
    const { id: threadId } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content) {
        return res.status(400).json({ error: 'Missing userId or content' });
    }

    try {
        await db.query(
            `INSERT INTO "forumReplies" ("threadId", "userId", "content")
             VALUES ($1, $2, $3)`,
            [threadId, userId, content]
        );
        res.status(201).json({ message: 'Reply posted successfully' });
    } catch (err) {
        console.error('Error posting reply:', err);
        res.status(500).json({ error: 'Failed to post reply' });
    }
});

router.put('/thread/reply/:replyId', async (req, res) => {
    const { replyId } = req.params;
    const { content, userId } = req.body;
  
    if (!replyId || !content || !userId) {
      return res.status(400).json({ error: 'Missing content or userId' });
    }
  
    try {
      const result = await db.query(
        `UPDATE "forumReplies" 
        SET "content" = $1 
        WHERE "id" = $2 AND "userId" = $3
        RETURNING "id", "content"`,
        [content, replyId, userId]
      );

      
    if (result.rowCount === 0) {
        return res.status(403).json({ error: 'You are not authorized to edit this reply.' });
    }

      res.json({ updatedReply: result.rows[0] });
    } catch (err) {
      console.error('Error updating reply:', err);
      res.status(500).json({ error: 'Failed to update reply' });
    }
});
  

router.get('/getTopics', async (req, res) => {
    try {
      const result = await db.query(`SELECT "id", "name" FROM "forumTopics" ORDER BY "name"`);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching forum topics:', err);
      res.status(500).json({ error: 'Failed to fetch topics' });
    }
  });

module.exports = router;