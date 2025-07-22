import { useEffect , useRef } from 'react';

function App() {
  const canvasRef = useRef();
  useEffect(() =>{
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = "00ff00"; // Green color
    context.fillRect(0, 0, 150 , 75);
  } ,[]);

  return (
    <div className='App'>
      <canvas id="whiteboard" width="800" height="600"   ></canvas>
      <h1>My first app </h1>
    </div>
  );
}

export default App;
