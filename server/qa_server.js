const express = require('express');
const app = express();
const port = 8080;
const { db, allQuestions, allAnswers } = require('../database/qa/index.js');

app.use(express.json());

app.get('/qa/questions', (req, res) => {
  console.log(req.query);
  allQuestions(req.query.product_id, req.query.page, req.query.count, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});
app.get('/qa/questions/:question_id/answers', (req, res) => {
  allAnswers(req.params.question_id, req.query.page, req.query.count, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  })
})

app.post('/qa/questions/', (req, res) => {
  console.log(req.params);
  console.log(req.query);
  console.log(req.body);
  res.send('hello');
})

app.post('/qa/questions/:question_id/answers', (req, res) => {
  console.log(req.params);
  console.log(req.query);
  res.send('hello');
})

app.listen(port, () => {
  console.log(`QA Server listening at http://localhost:${port}`)
})