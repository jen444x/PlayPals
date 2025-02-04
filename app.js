var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
const db = require('./sql/config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/api/users');
var postsRouter = require('./routes/api/posts')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/images', express.static(path.join(__dirname, 'public/images')));


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
