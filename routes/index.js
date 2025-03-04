var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const viewsRouter = require('./views/views')

router.use('/', viewsRouter)

module.exports = router;
