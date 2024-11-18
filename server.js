const express = require("express");
const path = require('path');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'dev') {
    dotenv.config({path: path.join(__dirname, './.env.dev')});
} else {
    dotenv.config({path: path.join(__dirname, './.env.prod')});
}

// const { events } = require("./data"); //data sheet of events

const app = express();

//Add a NODEPORT=300X to the .env files
const port = process.env.NODEPORT;

app.get("/", (req, res) => {
  res.send("HELLO WORLD!billy bob \n");
});

// //delaney adds
// //disregard
// app.get("/api/events", (req, res) => {
//   res.send(events);
// });
// //end of delaney adds

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});
