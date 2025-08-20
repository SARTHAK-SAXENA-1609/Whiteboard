import { useContext, useEffect , useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import getStroke from 'perfect-freehand';
import boardContext from '../../store/board-context';
import toolboxContext from '../../store/toolbox-context';
import { ARROW_LENGTH, TOOL_ACTION_TYPES, TOOL_ITEMS } from '../../constants';
import classes from './index.module.css';
import { getSvgPathFromStroke } from '../../utils/element';
import { getArrowHeadsCoordinates } from '../../utils/math';
import socket from "../../utils/socket";

function Board({id}) {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  const{ elements ,
     boardMouseDownHandler ,
      boardMouseMoveHandler ,
      toolActionType ,
       boardMouseUpHandler,
      textAreaBlurHandler,
      undo,
      redo,
      setCanvasId,
      setElements,
      setHistory
      } = useContext(boardContext);

      // const { toolboxState } = useContext(toolboxContext);

      const token = localStorage.getItem("whiteboard_user_token");
      const [isAuthorized, setIsAuthorized] = useState(true);

      // Main effect for handling socket connection, auth, and data loading
      useEffect(() => {
        if (!id || !token) {
          setElements([]);
          setHistory([]);
          return;
        }
    
        // Ensure the socket has the correct auth token before connecting.
        // This is crucial for handling login without a page refresh.
        socket.io.opts.extraHeaders = {
          Authorization: `Bearer ${token}`
        };
        socket.connect();

        setCanvasId(id);
        socket.emit("joinCanvas", { canvasId: id });
    
        const handleLoadCanvas = (initialElements) => {
          console.log("Canvas data loaded via socket.");
          setElements(initialElements || []);
          setHistory(initialElements || []);
          setIsAuthorized(true);
        };
    
        const handleReceiveDrawingUpdate = (updatedElements) => {
          setElements(updatedElements);
        };
    
        const handleUnauthorized = (data) => {
          console.error("Authorization failed:", data.message);
          alert(`Access Denied: ${data.message}`);
          setIsAuthorized(false);
        };
    
        const handleError = (error) => {
            console.error("Socket error:", error.message);
            alert(`A server error occurred: ${error.message}`);
        };
    
        socket.on("loadCanvas", handleLoadCanvas);
        socket.on("receiveDrawingUpdate", handleReceiveDrawingUpdate);
        socket.on("unauthorized", handleUnauthorized);
        socket.on("error", handleError);
    
        // Cleanup function to remove listeners and disconnect
        return () => {
          socket.disconnect();
          socket.off("loadCanvas", handleLoadCanvas);
          socket.off("receiveDrawingUpdate", handleReceiveDrawingUpdate);
          socket.off("unauthorized", handleUnauthorized);
          socket.off("error", handleError);
        };
      }, [id, token, setCanvasId, setElements, setHistory]);
    
      // Effect for sending drawing updates to the server with a debounce
      useEffect(() => {
        if (!isAuthorized) return;
        // Debounce to avoid sending too many events
        const timer = setTimeout(() => {
          socket.emit("drawingUpdate", { canvasId: id, elements });
        }, 500);

        return () => clearTimeout(timer);
      }, [elements, id, isAuthorized]);


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

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);
    const gen = rough.generator();

    elements.forEach( (element) => {
      const options = {
        seed: element.id + 1,
        fillStyle: 'solid',
        stroke: element.stroke,
        fill: element.fill,
        strokeWidth: element.size,
      };

      switch (element.type) {
        case TOOL_ITEMS.LINE: {
          const line = gen.line(element.x1, element.y1, element.x2, element.y2, options);
          roughCanvas.draw(line);
          break;
        }
        case TOOL_ITEMS.RECTANGLE: {
          const rect = gen.rectangle(element.x1, element.y1, element.x2 - element.x1, element.y2 - element.y1, options);
          roughCanvas.draw(rect);
          break;
        }
        case TOOL_ITEMS.CIRCLE: {
          const cx = (element.x1 + element.x2) / 2, cy = (element.y1 + element.y2) / 2;
          const width = element.x2 - element.x1, height = element.y2 - element.y1;
          const circle = gen.ellipse(cx, cy, width, height, options);
          roughCanvas.draw(circle);
          break;
        }
        case TOOL_ITEMS.ARROW: {
          const { x3, y3, x4, y4 } = getArrowHeadsCoordinates(element.x1, element.y1, element.x2, element.y2, ARROW_LENGTH);
          const points = [[element.x1, element.y1], [element.x2, element.y2], [x3, y3], [element.x2, element.y2], [x4, y4]];
          const arrow = gen.linearPath(points, options);
          roughCanvas.draw(arrow);
          break;
        }
        case TOOL_ITEMS.BRUSH: {
          const path = new Path2D(getSvgPathFromStroke(getStroke(element.points)));
          context.save();
          context.fillStyle = element.stroke;
          context.fill(path);
          context.restore();
          break;
        }
        case TOOL_ITEMS.TEXT : {
          context.save();
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
    });
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

  const lastElement = elements.length > 0 ? elements[elements.length - 1] : null;

  return (
    <>
    {toolActionType === TOOL_ACTION_TYPES.WRITING && lastElement && (
        <textarea
          type="text"
          ref={textAreaRef}
          className={classes.textElementBox}
          style={{
            top: lastElement.y1,
            left: lastElement.x1,
            fontSize: `${lastElement.size}px`,
            color: lastElement.stroke,
          }}
          onBlur={(event) => textAreaBlurHandler(event.target.value)}
        />
      )}
  
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