var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const viewsRouter = require('./views/views')
const usersRouter = require('./api/users')
const postsRouter = require('./api/posts')

router.use('/', viewsRouter)
router.use('/users', usersRouter)
router.use('/posts', postsRouter)

module.exports = router;
