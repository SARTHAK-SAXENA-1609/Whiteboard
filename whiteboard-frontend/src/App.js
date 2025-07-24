import Board from './Components/Board';
import Toolbar from './Components/Toolbar';
import BoardProvider from './store/boardProvider';

function App() {
  return (
    <BoardProvider>
      <Toolbar />
      <Board />
    </BoardProvider>
       
)}

export default App;
