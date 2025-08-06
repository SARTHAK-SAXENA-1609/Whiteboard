import Board from './Components/Board';
import Toolbar from './Components/Toolbar';
import BoardProvider from './store/boardProvider';
import ToolboxProvider from './store/toolboxProvider';
import Toolbox from './Components/Toolbox';

import axios from "axios"
import { useEffect, useState } from 'react';




function App() {
  const [data , setData] = useState(null);

  useEffect(()=>{
    axios.get('http://localhost:3030/data')
      .then(response => setData(response))
      .catch(error => console.error('Error fetching data:', error));  
  } , []);

  return (
    // <BoardProvider>
    //   <ToolboxProvider>
    //     <Toolbar />
    //     <Board />
    //     <Toolbox />
    //   </ToolboxProvider>
    // </BoardProvider>
    <div>
      <h1>Data from Backend:</h1>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
    </div>
       
)}

export default App;
