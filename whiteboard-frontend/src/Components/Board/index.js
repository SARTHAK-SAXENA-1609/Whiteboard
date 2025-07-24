import { useCallback, useContext, useEffect , useRef } from 'react';
import rough from 'roughjs';
import boardContext from '../../store/board-context';
import { TOOL_ACTION_TYPES } from '../../constants';

function Board() {
  const canvasRef = useRef();
  const{ elements , boardMouseDownHandler , boardMouseMoveHandler ,toolActionType , boardMouseUpHandler } = useContext(boardContext);

  useEffect(() =>{
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.save();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const roughCanvas = rough.canvas(canvas);
    elements.forEach( (element) => {
      roughCanvas.draw(element.roughEle);      
    })

    return () => {
      context.clearRect(0 , 0 , canvas.width , canvas.height);
    };

  } ,[elements]);

  // useEffect ( () => {
  //   const canvas = canvasRef.current;
  //   const context = canvas.getContext('2d');
  //   const roughCanvas = rough.canvas(canvas);
  //   let rect1= roughCanvas.rectangle(110, 120, 300, 300, {
  //     fill: 'red',
  //     stroke: 'black',
  //   });
  //   roughCanvas.draw(rect1);
  // } , []);

  const handleBoardMouseDown = (event) => {
    boardMouseDownHandler(event);
  };
  
  const handleMouseMove = (event) => {
    if(toolActionType === TOOL_ACTION_TYPES.DRAWING){
      boardMouseMoveHandler(event);
    }
  };

  const handleMouseUp = (event) => {
    boardMouseUpHandler();
  };

  return <canvas 
    ref = {canvasRef} 
    onMouseDown = {handleBoardMouseDown} 
    onMouseMove = {handleMouseMove}
    onMouseUp = {handleMouseUp}
 />; 
}

export default Board;