const express = require("express");
// const { events } = require("./data"); //data sheet of events

const app = express();

const port = 3000;

app.get("/", (req, res) => {
  console.log("Request Received");
  //res.status(200).send("HELLO WORLD!\n");
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
