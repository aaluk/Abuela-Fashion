import React, { useState, useEffect, useContext, Suspense, lazy } from 'react';
import axios from 'axios';
import AppContext from '../../AppContext.js';
import QuestionsContext from './QuestionsContext.js';
import styled from 'styled-components';
import { serverURL } from '../../config.js';

const Questions = lazy(() => import('./Questions.jsx'));
const Search = lazy(() => import('./Search.jsx'));

export default function QuestionsAnswers() {
  // STATE
  const [questionsData, setQuestionsData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [useFilteredData, setUseFilteredData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // CONTEXT
  const { productsContext, selectedProductContext } = useContext(AppContext);

  const [products, setProducts] = productsContext;

  const [selectedProduct, setSelectedProduct] = selectedProductContext;

  // METHODS
  const handleSearchQuery = query => {
    setSearchQuery(query);
    setUseFilteredData(true);
    if (query.length < 2) {
      setFilteredQuestions(questionsData.results);
    } else {
      const questionsCopy = [...questionsData.results];
      const questionsFiltered = questionsCopy.filter(question =>
        question.question_body.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredQuestions(questionsFiltered);
    }
  };

  useEffect(() => {
    const getQs = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/qa/questions`, {
          params: {
            product_id: selectedProduct?.id,
            // page: 1,
            count: 20,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setQuestionsData(res.data);
        setIsLoaded(true);
      } catch (err) {
        console.error(err);
      }
    };

    getQs();
  }, [selectedProduct]);

  return (
    <div className='questions-and-answers' id='questions-answers'>
      {isLoaded && (
        <>
          <QuestionsContext.Provider
            value={{
              questionsData,
              setQuestionsData,
              useFilteredData,
              setUseFilteredData,
            }}
          >
            <QandAHeader>Questions &#38; Answers</QandAHeader>
            <Suspense fallback={<div>Loading...</div>}>
              <Search handleChange={handleSearchQuery} />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
              <Questions
                questionsData={questionsData.results}
                filteredData={filteredQuestions}
                searchQuery={searchQuery}
              />
            </Suspense>
          </QuestionsContext.Provider>
        </>
      )}
    </div>
  );
}

const QandAHeader = styled.h3`
  font-size: xx-large;
  text-align: center;
  padding-bottom: 1rem;
  font-family: 'Lobster Two', cursive;
  color: #fdf0d5;
`;
