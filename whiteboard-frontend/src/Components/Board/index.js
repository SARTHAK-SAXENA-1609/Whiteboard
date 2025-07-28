import { useCallback, useContext, useEffect , useLayoutEffect, useRef } from 'react';
import rough from 'roughjs';
import boardContext from '../../store/board-context';
import toolboxContext from '../../store/toolbox-context';
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from '../../constants';

function Board() {
  const canvasRef = useRef();
  const{ elements , boardMouseDownHandler , boardMouseMoveHandler ,toolActionType , boardMouseUpHandler } = useContext(boardContext);

  // here use layout effect is used instead of use effect
  // Timing: Runs after React renders your component but before the browser paints the changes to the screen.
  // behavior: It's synchronous and blocks the browser from painting. React will wait for your effect to finish 
  // before it visually updates the screen.
  // Use this only when your effect needs to measure the DOM (e.g., get an element's height or scroll position) 
  // and then make a change that needs to be visible in the very same paint. This is primarily to avoid a visual 
  // flicker, where a component renders in one state and then quickly re-renders to another.

  useLayoutEffect(() =>{
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.save();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const roughCanvas = rough.canvas(canvas);
    elements.forEach( (element) => {
      switch (element.type) {
        case TOOL_ITEMS.LINE :
        case TOOL_ITEMS.RECTANGLE :
        case TOOL_ITEMS.CIRCLE :
        case TOOL_ITEMS.ARROW :
          roughCanvas.draw(element.roughEle);    
          break;  
        case TOOL_ITEMS.BRUSH : 
          context.fillStyle = element.stroke;
          context.fill(element.path);
          context.restore();
            break;    
        default:
          throw new Error('Type not recognized');
      }

    })

    return () => {
      context.clearRect(0 , 0 , canvas.width , canvas.height);
    };

  } ,[elements]);

  const { toolboxState } = useContext(toolboxContext);

  const handleBoardMouseDown = (event) => {
    boardMouseDownHandler(event , toolboxState );
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