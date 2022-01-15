const express = require('express');
const app = express();
const port = 8080;
const { db, allQuestions, allAnswers, postQuestion, postAnswer, qHelpfulness, aHelpfulness, qReport, aReport } = require('../database/qa/index.js');

app.use(express.json());

app.get('/qa/questions', (req, res) => {
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
  const date = Date.now();
  postQuestion(req.body, date, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send('Created');
    }
  })
})

app.post('/qa/questions/:question_id/answers', (req, res) => {
  const date = Date.now();
  postAnswer(req.params.question_id, req.body, date, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send('Created');
    }
  })
})

app.put('/qa/questions/:question_id/helpful', (req,res) => {
  qHelpfulness(req.params.question_id, (err, result) => {
    if (err) {
      res.send(err)
    } else {
      res.status(204).send();
    }
  });
})

app.put('/qa/questions/:question_id/report', (req,res) => {
  qReport(req.params.question_id, (err, result) => {
    if (err) {
      res.send(err)
    } else {
      res.status(204).send();
    }
  });
})

app.put('/qa/answers/:answer_id/helpful', (req,res) => {
  aHelpfulness(req.params.answer_id, (err, result) => {
    if (err) {
      res.send(err)
    } else {
      res.status(204).send();
    }
  });
})

app.put('/qa/answers/:answer_id/report', (req,res) => {
  aReport(req.params.answer_id, (err, result) => {
    if (err) {
      res.send(err)
    } else {
      res.status(204).send();
    }
  });
})

app.listen(port, () => {
  console.log(`QA Server listening at http://localhost:${port}`)
})