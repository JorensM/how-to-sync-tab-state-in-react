import React from 'react';
import logo from './logo.svg';
import './App.css';
import useTabState from './useTabState';

function App() {

  const [ count, setCount ] = useTabState<number>(0, 'count')

  return (
    <div className="App">
      <span>{ count.toString() }</span>
      <button
        onClick={() => setCount(count + 1)}
      >
        +
      </button>
    </div>
  );
}

export default App;
