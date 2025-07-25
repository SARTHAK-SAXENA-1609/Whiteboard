import Board from './Components/Board';
import Toolbar from './Components/Toolbar';
import BoardProvider from './store/boardProvider';
import ToolboxProvider from './store/toolboxProvider';
import Toolbox from './Components/Toolbox';


function App() {
  return (
    <BoardProvider>
      <ToolboxProvider>
        <Toolbar />
        <Board />
        <Toolbox />
      </ToolboxProvider>
    </BoardProvider>
       
)}

export default App;
