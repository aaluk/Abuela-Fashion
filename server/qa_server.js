const express = require('express');
const app = express();
const port = 8080;
const { db, allQuestions } = require('../database/qa/index.js');

app.get('/', (req, res) => {
  allQuestions(1, 1, 5, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
})

app.listen(port, () => {
  console.log(`QA Server listening at http://localhost:${port}`)
})