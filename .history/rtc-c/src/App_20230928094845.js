import {Routes, Route} from 'react-router-dom'
import {Meeting} from './Components/Meet'

function App() {
  return (
    <Routes>
        <Route path="/meeting/:roomId"  Component={Meeting} />
    </Routes>
  );
}

export default App;
