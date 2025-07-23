import { useEffect , useRef } from 'react';
import rough from 'roughjs';

function Board() {
  const canvasRef = useRef();
  useEffect(() =>{
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const roughCanvas = rough.canvas(canvas);
    let rect1= roughCanvas.rectangle(110, 120, 300, 300, {
      fill: 'red',
      stroke: 'black',
    });
    roughCanvas.draw(rect1);
  } ,[]);

  return <canvas ref = {canvasRef} />; 
}

export default Board;