import { useContext, useEffect , useLayoutEffect, useRef } from 'react';
import rough from 'roughjs';
import boardContext from '../../store/board-context';
import toolboxContext from '../../store/toolbox-context';
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from '../../constants';
import classes from './index.module.css';
// import socket from "../../utils/socket";

function Board() {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  const{ elements ,
     boardMouseDownHandler ,
      boardMouseMoveHandler ,
      toolActionType ,
       boardMouseUpHandler,
      textAreaBlurHandler,
      undo,
      redo
      } = useContext(boardContext);

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
        case TOOL_ITEMS.TEXT : {
          context.textBaseline = "top";
          context.font = `${element.size}px Caveat`;
          context.fillStyle = element.stroke;
          context.fillText(element.text, element.x1, element.y1);
          context.restore();
          break;
        }  
        default:
          throw new Error('Type not recognized');
      }

    })

    return () => {
      context.clearRect(0 , 0 , canvas.width , canvas.height);
    };

  } ,[elements]);

  const { toolboxState } = useContext(toolboxContext);

  useEffect(()=>{
    const textArea = textAreaRef.current;
    if(toolActionType === TOOL_ACTION_TYPES.WRITING){
      setTimeout(()=>{
        textArea.focus();
      } , 0);
    }
  } , [toolActionType] )


  useEffect(()=>{
    function handleKeyDown ( event ) {
      if(event.ctrlKey && event.key === 'z'){
        undo();
      }
      else if(event.ctrlKey && event.key === 'y'){
        redo();
      }
    }

    document.addEventListener("keydown" , handleKeyDown);
    return () => {
      document.removeEventListener("keydown" , handleKeyDown);
    };
  } , [undo , redo])

  const handleBoardMouseDown = (event) => {
    boardMouseDownHandler(event , toolboxState );
  };
  
  const handleMouseMove = (event) => {
      boardMouseMoveHandler(event);
  };

  const handleMouseUp = (event) => {
    boardMouseUpHandler();
  };

  return (
    <>
    {toolActionType === TOOL_ACTION_TYPES.WRITING && <textarea
      type = "text"
      ref = {textAreaRef}
      className={classes.textElementBox}
      style={{
        top : elements[elements.length-1].y1,
        left : elements[elements.length-1].x1,
        fontSize : `${elements[elements.length-1]?.size }px`,
        color : elements[elements.length-1]?.stroke,
      }}
      onBlur = {(event) => textAreaBlurHandler(event.target.value , toolboxState)}
    /> }
  
    <canvas 
      ref = {canvasRef} 
      id = "canvas"
      onMouseDown = {handleBoardMouseDown} 
      onMouseMove = {handleMouseMove}
      onMouseUp = {handleMouseUp}
     />
     </>
 )
 ; 
}

export default Board;