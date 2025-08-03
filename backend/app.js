var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const multer = require("multer");
const auth = require("./middleware/auth");
const cors = require("cors");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://playpals-app.com',
    'https://test1.playpals-app.com',
    'https://test2.playpals-app.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/api/users");
var postsRouter = require("./routes/api/posts");
var apiForumRouter = require("./routes/api/forum");
var pagesRouter = require("./routes/pages/pages");
var forumRouter = require("./routes/pages/forum");
var discussionRouter = require("./routes/api/discussions");
var petsRouter = require("./routes/api/pets");
var authRouter = require("./routes/api/auth");
var chatUploadRouter = require("./routes/api/chat");
var chatRouter = require("./routes/api/chats");
var profileRouter = require("./routes/api/profile");
var eventsRouter = require("./routes/api/events");

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/forum", apiForumRouter);
app.use("/api/discussions", discussionRouter);
app.use("/", pagesRouter);
app.use("/forum", forumRouter);
app.use("/api/auth", authRouter);
app.use("/api/pets", petsRouter);
app.use("/api/chat", chatUploadRouter);
app.use("/api/chats", chatRouter);
app.use("/api/profile", profileRouter);
app.use("/api/events", eventsRouter);

app.use((req, res, next) => {
  console.log(`Request received: ${req.path}`);
  next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
