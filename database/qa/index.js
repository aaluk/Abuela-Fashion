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

  const queryString3 = "SELECT questions.question_id, questions.question_body, to_timestamp(questions.question_date/1000) as question_date, questions.asker_name, questions.question_helpfulness, COALESCE(json_object_agg(answers.answer_id, json_build_object('answer_id', answers.answer_id, 'body', answers.body, 'date', to_timestamp(answers.date/1000), 'answerer_name', answers.answerer_name, 'helpfulness', answers.helpfulness, 'photos',  json_build_array(json_strip_nulls(json_build_object('id', photos.id, 'url', photos.url))) )) FILTER (WHERE answers.answer_id IS NOT NULL), '{}') AS answers FROM questions LEFT JOIN answers ON answers.question_id = questions.question_id LEFT JOIN photos ON photos.answer_id = answers.answer_id WHERE questions.product_id = 1 AND questions.reported != 1 GROUP BY questions.question_id;"


  await db.query(queryString3)
    .then((data) => {
      let result = {
        product_id: product_id,
        results: data
      }
      callback(null, result);
    })
    .catch(err => {
      callback(err);
    })

}

const allAnswers = function(question_id, page, count, callback) {
  question_id = question_id || 1;
  page = page || 1;
  count = count || 5;

  let queryString2 = "SELECT answers.answer_id, answers.body, to_timestamp(answers.date/1000) as date, answers.answerer_name, answers.helpfulness, COALESCE(json_agg(json_build_object('id', photos.id, 'url', photos.url)) FILTER (WHERE photos.id IS NOT NULL), '[]') AS photos FROM answers LEFT JOIN photos ON photos.answer_id = answers.answer_id WHERE answers.question_id = $1 AND answers.reported != 1 GROUP BY answers.answer_id LIMIT $2;";

  let queryArray = [question_id, count];

  db.query(queryString2, queryArray)

    .then((data) => {
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

const postQuestion = function(data, date, callback) {
  let {body, name, email, product_id} = data;
  let queryString = "INSERT INTO questions(product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness) VALUES ($1, $2, $3, $4, $5, 0, 0);"
  let queryArray = [product_id, body, date, name, email];
  db.query(queryString, queryArray)
    .then( result => callback(null))
    .catch( err => callback(err));
}

const postAnswer = async function(question_id, data, date, callback) {
  let {body, name, email, photos} = data;
  // photos = JSON.parse(photos);
  let queryString = "INSERT INTO answers(question_id, body, date, answerer_name, answerer_email, reported, helpfulness) VALUES ($1, $2, $3, $4, $5, 0, 0);"
  let queryArray = [question_id, body, date, name, email];
  await db.query(queryString, queryArray)
    .then( result => callback(null))
    .catch( err => callback(err));


  //PUT THE PICTURE
}

const qHelpfulness = function(question_id, callback) {
  let queryString = "UPDATE questions SET question_helpfulness = question_helpfulness + 1 WHERE question_id = $1";
  let queryArray = [question_id];
  db.query(queryString, queryArray)
    .then( result => callback(null))
    .catch( err => callback(err));
}

const aHelpfulness = function(answer_id, callback) {
  let queryString = "UPDATE answers SET helpfulness = helpfulness + 1 WHERE answer_id = $1";
  let queryArray = [answer_id];
  db.query(queryString, queryArray)
    .then( result => callback(null))
    .catch( err => callback(err));
}

const qReport = function(question_id, callback) {
  let queryString = "UPDATE questions SET reported = reported + 1 WHERE question_id = $1";
  let queryArray = [question_id];
  db.query(queryString, queryArray)
    .then( result => callback(null))
    .catch( err => callback(err));
}

const aReport = function(answer_id, callback) {
  let queryString = "UPDATE answers SET reported = reported + 1 WHERE answer_id = $1";
  let queryArray = [answer_id];
  db.query(queryString, queryArray)
    .then( result => callback(null))
    .catch( err => callback(err));
}

console.log('Connected to the database');

module.exports = {
  pgp,
  db,
  allQuestions,
  allAnswers,
  postQuestion,
  postAnswer,
  qHelpfulness,
  aHelpfulness,
  qReport,
  aReport
};