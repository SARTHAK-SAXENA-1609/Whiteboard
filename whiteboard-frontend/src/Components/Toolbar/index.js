import React, { useContext } from 'react'
import classes from './index.module.css' 
import cx from 'classnames';
import {
  FaSlash,
  FaRegCircle,
  FaArrowRight,
  FaPaintBrush,
  FaEraser,
  FaUndoAlt,
  FaRedoAlt,
  FaFont,
  FaDownload,
} from "react-icons/fa";
import { LuRectangleHorizontal } from "react-icons/lu";
import boardContext from '../../store/board-context';
import { TOOL_ITEMS } from '../../constants';


const Toolbar = () => {
  const {activeToolItem , changeToolHandler , undo , redo } = useContext(boardContext);
  
const handleDownloadClick = () => {
    // 1. Get the original canvas
    const originalCanvas = document.getElementById("canvas");
    if (!originalCanvas) return;

    // 2. Create a new temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalCanvas.width;
    tempCanvas.height = originalCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // 3. Fill the temporary canvas with a white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 4. Draw the original canvas content on top of the white background
    tempCtx.drawImage(originalCanvas, 0, 0);

    // 5. Get the data URL from the temporary canvas
    const data = tempCanvas.toDataURL("image/png");

    // 6. Create a link and trigger the download
    const anchor = document.createElement('a');
    anchor.href = data;
    anchor.download = "board.png";
    anchor.click();
  };

  return (
    <div className = {classes.container} >

        <div className = { 
          cx(classes.toolItem , { [classes.active]: activeToolItem === TOOL_ITEMS.BRUSH })
        } 
        onClick = {()=> changeToolHandler(TOOL_ITEMS.BRUSH)  }
        >
          <FaPaintBrush /> 
        </div>


        <div className = { 
          cx(classes.toolItem , { [classes.active]: activeToolItem === TOOL_ITEMS.LINE })
        } 
        onClick = {()=> changeToolHandler(TOOL_ITEMS.LINE)  }
        >
          <FaSlash /> 
        </div>

        <div className = {
          cx(classes.toolItem , { [classes.active]: activeToolItem === TOOL_ITEMS.RECTANGLE })
        } onClick = { ()=> changeToolHandler(TOOL_ITEMS.RECTANGLE)  }>
           <LuRectangleHorizontal />
        </div>

        <div className = {
          cx(classes.toolItem , { [classes.active]: activeToolItem === TOOL_ITEMS.CIRCLE })
        } onClick = { ()=> changeToolHandler(TOOL_ITEMS.CIRCLE)  }>
           <FaRegCircle />
        </div>

        <div className = {
          cx(classes.toolItem , { [classes.active]: activeToolItem === TOOL_ITEMS.ARROW })
        } onClick = { ()=> changeToolHandler(TOOL_ITEMS.ARROW)  }>
           < FaArrowRight/>
        </div>

        <div className = {
          cx(classes.toolItem , { [classes.active]: activeToolItem === TOOL_ITEMS.ERASER })
        } onClick = { ()=> changeToolHandler(TOOL_ITEMS.ERASER)  }>
           < FaEraser/>
        </div>

        <div className = {
          cx(classes.toolItem , { [classes.active]: activeToolItem === TOOL_ITEMS.TEXT })
        } onClick = { ()=> changeToolHandler(TOOL_ITEMS.TEXT)  }>
           < FaFont/>
        </div>

        <div className = {
          classes.toolItem 
        } onClick = { ()=> undo()  }>
           < FaUndoAlt/>
        </div>

        <div className = {
          classes.toolItem 
        } onClick = { ()=> redo()  }>
           < FaRedoAlt/>
        </div>

        <div className = {
          classes.toolItem 
        } onClick = { ()=> handleDownloadClick()  }>
           < FaDownload/>
        </div>


    </div>
  )
}

export default Toolbar