import useTabState from './useTabState';

function App() {

  const [ count, setCount ] = useTabState<number>(0, 'count')

  return (
    <div>
      <button
        onClick={() => setCount(count + 1)}
      >
        { count }
      </button>
    </div>
  );
}

export default App;
