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

  const queryString2 = "SELECT questions.*, COALESCE(json_object_agg(answers.answer_id, json_build_object('id', answers.answer_id, 'body', answers.body, 'date', answers.date, 'answerer_name', answers.answerer_name, 'helpfulness', answers.helpfulness, 'photos', array_agg(photos.*))) FILTER (WHERE answers.answer_id IS NOT NULL), '{}') AS answers FROM questions LEFT JOIN answers ON answers.question_id = questions.question_id LEFT JOIN photos ON photos.answer_id = answers.answer_id WHERE questions.product_id = 1 GROUP BY questions.question_id;"

  const queryString3 = "SELECT questions.*, COALESCE(json_object_agg(answers.answer_id, json_build_object('id', answers.answer_id, 'body', answers.body, 'date', answers.date, 'answerer_name', answers.answerer_name, 'helpfulness', answers.helpfulness, 'photos', (json_build_object('id', photos.id, 'url', photos.url)))) FILTER (WHERE answers.answer_id IS NOT NULL), '{}') AS answers FROM questions LEFT JOIN answers ON answers.question_id = questions.question_id LEFT JOIN photos ON photos.answer_id = answers.answer_id WHERE questions.product_id = 1 GROUP BY questions.question_id;"

  const queryString4 = "SELECT questions.* FROM questions LEFT JOIN ( "


  await db.query(queryString2)
    .then((data) => {
      callback(null, data);
    })
    .catch(err => {
      callback(err);
    })

    .then(data => {
      callback(null, data);
        // success, data = either {count} or {count, logs}
    })
    .catch(error => {
        // failed
    });
}

const allAnswers = function(question_id, page, count, callback) {
  question_id = question_id || 1;
  page = page || 1;
  count = count || 5;

  let queryString2 = "SELECT answers.answer_id, answers.body, answers.date, answers.answerer_name, answers.helpfulness, COALESCE(json_agg(json_build_object('id', photos.id, 'url', photos.url)) FILTER (WHERE photos.id IS NOT NULL), '[]') AS photos FROM answers LEFT JOIN photos ON photos.answer_id = answers.answer_id WHERE answers.question_id = $1 AND answers.reported != 1 GROUP BY answers.answer_id LIMIT $2;";

  let queryArray = [question_id, count];

  db.query(queryString2, queryArray)
    .then((data) => {
      data.forEach((answerobject) => {
        answerobject.date = new Date(Number(answerobject.date));
      })
      let result = {
        question: question_id,
        page: page,
        count: count,
        results: data
      }
      callback(null, result);
    })
    .catch(err => {
      callback(err);
    });
}

const postQuestion = function(body, callback) {

}

console.log('Connected to the database');

module.exports = {
  pgp,
  db,
  allQuestions,
  allAnswers,
  postQuestion
};