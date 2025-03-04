const express = require('express');
const router = express.Router();
const db = require('../../sql/config');

router.get('/login', (req, res) => {
  res.render('login', {title: 'Login'});
});

router.get('/register', (req, res) => {
  res.render('register', {title: 'Register'});
});

router.get('/feed', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM post ORDER BY created_at DESC')
    res.render('feed', {
      title: "Feed",
      posts: result.rows
    })
  } catch (err) {
      console.error(err.message);
  }
});

router.get('/chat', (req, res) => {
  res.render('chat', {title: 'Chat Test'});
});

module.exports = router;