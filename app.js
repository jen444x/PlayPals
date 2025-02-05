var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
const multer = require('multer');
const db = require('./sql/config');
const server = require('./bin/www')

const app = express();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/api/users');
var postsRouter = require('./routes/api/posts')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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


app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

app.get('/login', (req, res) => {
  res.render('login', {title: 'Login'});
});

app.get('/register', (req, res) => {
  res.render('register', {title: 'Register'});
});

app.get('/feed', async (req, res) => {
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

app.get('/chat', (req, res) => {
  res.render('chat', {title: 'Chat Test'});
});

app.use((req, res, next) => {
    console.log(`Request received: ${req.path}`);
    next();
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
