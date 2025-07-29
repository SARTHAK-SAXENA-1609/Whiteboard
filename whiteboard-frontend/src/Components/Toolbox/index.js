import React, { useContext } from 'react';
import classes from './index.module.css';
import { COLORS, FILL_TOOL_TYPES, SIZE_TOOL_TYPES, STROKE_TOOL_TYPES, TOOL_ITEMS } from '../../constants';
import cx from 'classnames';
import toolboxContext from '../../store/toolbox-context';
import boardContext from '../../store/board-context';

const Toolbox = () => {
  const {activeToolItem} = useContext(boardContext);
  const {toolboxState , changeStroke , changeFill, changeSize} = useContext(toolboxContext);
  // console.log("Active Tool:", activeToolItem);
  // console.log("Toolbox State:", toolboxState);

  const strokeColor = toolboxState[activeToolItem]?.stroke;
  const fillColor = toolboxState[activeToolItem]?.fill;
  const size = toolboxState[activeToolItem]?.size;


  // console.log("Selected Stroke Color:", strokeColor);
  return (
    <div className={classes.container}>
      {STROKE_TOOL_TYPES.includes(activeToolItem) &&  (<div className={classes.selectOptionContainer}>
        <div className={classes.toolBoxLabel}> stroke </div>
        <div className={classes.colorsContainer}>
          {Object.keys(COLORS).map((k) => {
            return (
              <div
                key = {k}
                className={cx(classes.colorBox , {
                  [classes.activeColorBox] : strokeColor === COLORS[k] ,
                })}
                style={{ backgroundColor: COLORS[k] }}
                onClick={()=> changeStroke(activeToolItem , COLORS[k])}
              ></div>
            );
          })}
        </div>
      </div>
      )}

      {FILL_TOOL_TYPES.includes(activeToolItem) && (<div className={classes.selectOptionContainer}>
        <div className={classes.toolBoxLabel}> Fill </div>
        <div className={classes.colorsContainer}>
          {Object.keys(COLORS).map((k) => {
            return (
              <div
                key = {k}
                className={cx(classes.colorBox , {
                  [classes.activeColorBox] : fillColor === COLORS[k] ,
                })}
                style={{ backgroundColor: COLORS[k] }}
                onClick={()=> changeFill(activeToolItem , COLORS[k])}
              ></div>
            );
          })}
        </div>
      </div>
      )}


      {SIZE_TOOL_TYPES.includes(activeToolItem) && (<div className={classes.selectOptionContainer}>
        <div className={classes.toolBoxLabel}> {activeToolItem === TOOL_ITEMS.TEXT ? "Font Size" : "Brush Size"} </div>
        <input
            type="range"
            min = {activeToolItem === TOOL_ITEMS.TEXT ? 12 : 1}
            max = {activeToolItem === TOOL_ITEMS.TEXT ? 64 : 10}
            step={1}
            value={size}
            onChange={(event) => changeSize(activeToolItem, event.target.value)}
          ></input>
      </div>
      )}


    </div>
  );
};

export default Toolbox; 