import React, { useState, useContext, lazy, Suspense } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import QuestionsContext from './QuestionsContext.js';
import { serverURL } from '../../config.js';

const Answer = lazy(() => import('./Answer.jsx'));
const AddAnswer = lazy(() => import('./AddAnswer.jsx'));

export default function Question({ questionObj }) {
  // CONTEXT
  const { questionsData, setQuestionsData } = useContext(QuestionsContext);

  // STATE
  const [
    hasQuestionHelpfulCountIncremented,
    setHasQuestionHelpfulCountIncremented,
  ] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [hasQuestionBeenReported, setHasQuestionBeenReported] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // METHODS
  const increaseQuestionHelpfulCount = async (e, questionObj) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const body = {};
      const res = await axios.put(`http://localhost:8080/qa/questions/${questionObj.question_id}/helpful`, body, {
        params: {
          question_id: questionObj.question_id,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Q HELPFUL PUT RES: ', res);

      const questionsDataCopy = [...questionsData.results];
      let incrementedCount = questionObj.question_helpfulness + 1;
      for (let i = 0; i < questionsDataCopy.length; i++) {
        let question = questionsDataCopy[i];
        for (let key in question) {
          if (
            question[key] === questionObj.question_id &&
            !hasQuestionHelpfulCountIncremented
          ) {
            question.question_helpfulness = incrementedCount;
            setHasQuestionHelpfulCountIncremented(true);
          }
        }
      }
      setQuestionsData({
        product_id: questionsData.product_id,
        results: questionsDataCopy,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuestionsReported = async (e, questionObj) => {
    e.preventDefault();
    e.stopPropagation();
    const body = {};
    try {
      const res = await axios.put(`http://localhost:8080/qa/questions/${questionObj.question_id}/report`, body, {
        params: {
          question_id: questionObj.question_id,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Q REPORTED PUT RES: ', res);

      const questionsDataCopy = [...questionsData.results];
      const idx = questionsDataCopy.findIndex(
        question => question.question_id === questionObj.question_id
      );
      if (!hasQuestionBeenReported) {
        questionsDataCopy[idx].reported = true;
        setQuestionsData({
          product_id: questionsData.product_id,
          results: questionsDataCopy,
        });
        setHasQuestionBeenReported(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAnsModal = e => {
    e.preventDefault();
    e.stopPropagation();
    setShowAnswerModal(true);
  };

  // VARIABLES
  const renderQ = () => {
    return (
      <QuestionPortion onClick={() => setIsExpanded(!isExpanded)}>
        <QuestionLeftSide>
          <QuestionBodySec>Q: {questionObj.question_body}</QuestionBodySec>{' '}
        </QuestionLeftSide>
        <QuestionRightSide>
          <QuestionHelpfulSec>
            Helpful?{' '}
            <a
              href=''
              onClick={e => increaseQuestionHelpfulCount(e, questionObj)}
              style={{ color: 'green' }}
            >
              <u>Yes</u>
            </a>{' '}
            ({questionObj.question_helpfulness})&nbsp;|&nbsp;
          </QuestionHelpfulSec>{' '}
          <QuestionReportedSec>
            <a
              href=''
              onClick={e => handleQuestionsReported(e, questionObj)}
              style={{ color: 'red' }}
            >
              <u>{questionObj.reported ? 'Reported' : 'Report'}</u>
            </a>
            &nbsp;|&nbsp;
          </QuestionReportedSec>
          <AddAnswerSec>
            {' '}
            <a href='' onClick={openAnsModal} style={{ color: 'dodgerblue' }}>
              {' '}
              <u>Add Answer</u>
            </a>
          </AddAnswerSec>
          {(isExpanded && (
            <svg
              style={{ transform: 'rotate(178deg)' }}
              stroke='currentColor'
              fill='currentColor'
              strokeWidth='0'
              viewBox='0 0 512 512'
              height='2rem'
              width='2rem'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z'></path>
            </svg>
          )) || (
            <svg
              stroke='currentColor'
              fill='currentColor'
              strokeWidth='0'
              viewBox='0 0 512 512'
              height='2rem'
              width='2rem'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z'></path>
            </svg>
          )}
        </QuestionRightSide>
      </QuestionPortion>
    );
  };

  return (
    <Container style={{ maxHeight: (isExpanded && '400px') || '45px' }}>
      {renderQ()}
      {isExpanded && (
        <>
          <br />
          <hr />
          <Suspense fallback={<div>Loading...</div>}>
            <Answer questionObj={questionObj} />
          </Suspense>
        </>
      )}
      {showAnswerModal && (
        <>
          <Suspense fallback={<div>Loading...</div>}>
            <AddAnswer
              closeModal={() => setShowAnswerModal(false)}
              question={questionObj}
            />
          </Suspense>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  font-family: 'Poppins', sans-serif;
  background-color: #fdf0d5;
  color: #38062b;
  margin-top: 10px;
  box-shadow: 1px 1px 10px #ccc;
  padding: 15px;
  border-radius: 10px;
  min-width: 97%;
`;

const QuestionPortion = styled.div`
  margin-top: 10px;
  cursor: pointer;
`;

const QuestionLeftSide = styled.div`
  float: left;
`;

const QuestionRightSide = styled.div`
  display: flex;
  -webkit-align-content: stretch;
  -webkit-box-pack: end;
  -webkit-justify-content: flex-end;
  align-items: flex-start;
`;

const QuestionBodySec = styled.span`
  font-weight: bold;
`;

const QuestionHelpfulSec = styled.span``;

const QuestionReportedSec = styled.span``;

const AddAnswerSec = styled.span`
  margin-right: 10px;
`;
