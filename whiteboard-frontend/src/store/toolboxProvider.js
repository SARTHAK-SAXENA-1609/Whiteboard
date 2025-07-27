import React, { act, useReducer } from 'react';
import toolboxContext from './toolbox-context';
import { COLORS, TOOL_ITEMS, TOOLBOX_ACTIONS } from '../constants';

const toolboxReducer = (state, action) => {
  switch (action.type) {
    case TOOLBOX_ACTIONS.CHANGE_STROKE : {
        const newState = {...state};
        newState[action.payload.tool].stroke = action.payload.stroke;
        return newState;
    }
    case TOOLBOX_ACTIONS.CHANGE_FILL : {
        const newState = {...state};
        newState[action.payload.tool].fill = action.payload.fill;
        return newState;
    }
    case TOOLBOX_ACTIONS.CHANGE_SIZE : {
      const newState = {...state};
      newState[action.payload.tool].size = action.payload.size;
      return newState;
    }
    default:
      return state;
  }
};

const intitialToolboxState = {
  [TOOL_ITEMS.LINE]: {
    stroke: COLORS.BLACK,
    size: 1,
  },
  [TOOL_ITEMS.RECTANGLE]: {
    stroke: COLORS.BLACK,
    fill: null,
    size: 1,
  },
  [TOOL_ITEMS.CIRCLE]: {
    stroke: COLORS.BLACK,
    fill: null,
    size: 1,
  },
  [TOOL_ITEMS.ARROW]: {
    stroke: COLORS.BLACK,
    size: 1,
  },
};


const ToolboxProvider = ({ children }) => {
  const [toolboxState, distpatchToolboxAction] = useReducer(
    toolboxReducer,
    intitialToolboxState
  );

  const changeStrokeHandler = (tool , stroke ) => {
    distpatchToolboxAction({
        type : TOOLBOX_ACTIONS.CHANGE_STROKE,
        payload : {
            tool,
            stroke,
        }
    })
  }

  const changeFillHandler = (tool , fill ) => {
    distpatchToolboxAction({
        type : TOOLBOX_ACTIONS.CHANGE_FILL,
        payload : {
            tool,
            fill,
        }
    })
  }

  const changeSizeHandler = (tool , size ) => {
    distpatchToolboxAction({
        type : TOOLBOX_ACTIONS.CHANGE_SIZE,
        payload : {
            tool,
            size,
        }
    })
  } 

  const toolboxContextValue = {
    toolboxState,
    changeStroke : changeStrokeHandler,
    changeFill : changeFillHandler,
    changeSize : changeSizeHandler,
  };

  return (
    <toolboxContext.Provider value={toolboxContextValue}>
      {children}
    </toolboxContext.Provider>
  );
};

export default ToolboxProvider;