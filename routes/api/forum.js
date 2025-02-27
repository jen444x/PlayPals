var express = require('express');
var router = express.Router();
const db = require('../../sql/config');
const multer = require('multer');
const path = require('path');
const { readdir } = require('fs');

router.post('/submitForumTopic', async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Request body is empty' });
    }
    const {name, description}= req.body;
    console.log('Received: ', name, description)
    try {
        const query = {
            text: 'INSERT INTO "forumTopic" ("topicName", "topicDesc") VALUES ($1, $2)',
            values: [name, description],
        }
        const result = await db.query(query)
        console.log('Inserted: ', result.rows[0])
        res.redirect('/forum')
    } catch (err) {
        console.log(err.message);
    }
})

router.post('/submitForumSubTopic', async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Request body is empty' });
    }
    const {topicId, name, description}= req.body;
    console.log('Received: ', name, description)
    try {
        const query = {
            text: 'INSERT INTO "forumSubTopic" ("inTopicId", "subTopicName", "subTopicDesc") VALUES ($1, $2, $3)',
            values: [topicId, name, description],
        }
        const result = await db.query(query)
        console.log('Inserted: ', result.rows[0])
        res.redirect('/forum')
    } catch (err) {
        console.log(err.message);
    }
})

router.post('/submitForumThread', async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Request body is empty' });
    }
    const {subTopicId, name, body} = req.body
    console.log("Received ", name, body)

    try {
        const queryThread = { 
        text:'INSERT INTO "forumsThread" ("inSubTopicId", "threadTitle") VALUES ($1, $2) RETURNING "threadId"',
        values: [subTopicId, name]
        }

        const threadRes = await db.query(queryThread);
        const threadId = threadRes.rows[0].threadId;

        const initPost = {
            text:'INSERT INTO "forumPosts" ("postThreadId", "postContent") VALUES ($1, $2)',
            values: [threadId, body]
        }

        await db.query(initPost);

        return res.redirect(`/forum/subTopic/${subTopicId}`);
    } catch (err) {
        console.log(err.message)
    }
})

router.get('/getForumTopics', async (req, res) => {
    try {
        const topics = await db.query('SELECT * FROM "forumTopic" ORDER BY "topicName"')
        const subTopics = await db.query('SELECT * FROM "forumSubTopic"')
        res.render('forum', {topics: topics.rows, subTopics: subTopics.rows})
    } catch (err) {
        console.error(err.message);
    }
})

module.exports = router;