const pgp = require('pg-promise')();
const db = pgp('postgres://s130655@localhost:5432/qa')

// db.any('SELECT * FROM questions WHERE product_id = 1 limit 20')
//   .then(function (data) {
//     console.log('DATA:', data)
//   })
//   .catch(function (error) {
//     console.log('ERROR:', error)
//   })

const allQuestions = async function (product_id, page, count, callback) {
  product_id = product_id || 1;
  page = page || 1;
  count = count || 5;
  const queryArray = [product_id, page, count];
  const queryString = 'SELECT * FROM questions WHERE product_id = 1 limit 5';

  const queryString2 = "SELECT questions.*, json_agg(json_build_object(||'answers.answer_id'||, answers.*)) AS answers FROM questions LEFT JOIN answers ON answers.question_id = questions.question_id WHERE questions.product_id = 1 GROUP BY questions.question_id;"

  const queryString3 = "SELECT questions.*, jsonb_object_agg(answers.answer_id, answers.*) AS answers FROM questions LEFT JOIN answers ON answers.question_id = questions.question_id WHERE questions.product_id = 1 GROUP BY questions.question_id;"

  var questions;
  var answers;
  var photos;
  await db.any(queryString2)
    .then((data) => {
      callback(null, data);
    })
    .catch(err => {
      callback(err);
    })

//   db.task(t => {
//     // execute a chain of queries against the task context, and return the result:
//     return t.any('SELECT * FROM questions WHERE product_id = 1')
//         .then(questions => {
//             if(questions.length > 0) {
//                 return t.any('SELECT * FROM answers WHERE question_id = $1', 1)
//                     .then(logs => {
//                       console.log(logs);
//                       return {questions, logs};
//                     })
//             }
//             console.log(questions);
//             return {questions};
//         });
// })
    .then(data => {
      callback(null, data);
        // success, data = either {count} or {count, logs}
    })
    .catch(error => {
        // failed
    });
}


console.log('Connected to the database');

module.exports = {
  pgp, db, allQuestions
};