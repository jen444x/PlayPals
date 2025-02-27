const express = require('express');
const router = express.Router();
const db = require('../../sql/config');

router.get('/', async (req, res) => {
    try {
        const topics = await db.query('SELECT * FROM "forumTopic" ORDER BY "topicName"')
        const subTopics = await db.query('SELECT * FROM "forumSubTopic"')
        res.render('forum', {title: 'Forum', topics: topics.rows, subTopics: subTopics.rows})
    } catch (err) {
        console.error(err.message)
    }
})

router.get('/subTopic/:subTopicId', async (req, res) => {
    const subTopicId = req.params.subTopicId;

    try {
        const subTopicQuery = await db.query(
            'SELECT * FROM "forumSubTopic" WHERE "subTopicId" = $1', [subTopicId]
        );
        
        if (subTopicQuery.rows.length === 0) {
            return res.status(404).send('Subtopic not found');
        }


        const threadsQuery = await db.query(
            'SELECT * FROM "forumsThread" WHERE "inSubTopicId" = $1 ORDER BY "threadId" DESC', [subTopicId]
        );
        
        const subTopic = subTopicQuery.rows[0];

        res.render('forumSubTopic', {
            title: subTopic.subTopicName,
            subTopic,
            threads: threadsQuery.rows
        });
    } catch (err) {
        console.error(err.message);
    }
})

router.get('/post/:threadId', async (req, res) => {
  const subTopicId = req.params.id;
})

module.exports = router;