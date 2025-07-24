import { useEffect , useRef } from 'react';
import rough from 'roughjs';

function Board() {
  const canvasRef = useRef();
  useEffect(() =>{
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext('2d');
    const roughCanvas = rough.canvas(canvas);
    let rect1= roughCanvas.rectangle(110, 120, 300, 300, {
      fill: 'red',
      stroke: 'black',
    });
    roughCanvas.draw(rect1);
  } ,[]);

  const handleBoardMouseDown = (event) => {
    const clientX = event.clientX;
    const clientY = event.clientY;
    console.log(clientX , clientY);
  };
  // console.log("HELLO");

  return <canvas ref = {canvasRef} onMouseDown={handleBoardMouseDown} />; 
}

export default Board;