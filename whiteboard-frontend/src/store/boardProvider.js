import React, { useReducer, useState } from 'react'
import boardContext from './board-context';
import { TOOL_ITEMS } from '../constants';

const boardReducer = (state , action) => {
  switch (action.type) {
    case "CHANGE_TOOL":
      return {
        ...state,
        activeToolItem : action.payload.tool,
      }
  
    default:
      return state;
  }
}

const initialBoardState = {
  activeToolItem : TOOL_ITEMS.LINE,
  elements : [],
};

const BoardProvider = ({children}) => {
  const [boardState , distpatchBoardAction] = useReducer(boardReducer , initialBoardState);
  // const [activeToolItem , setActiveToolItem] = useState(TOOL_ITEMS.LINE);

  const handleToolItemClick = (tool)=> {
    distpatchBoardAction({
      type : "CHANGE_TOOL",
      payload : {
        tool,
      },
    });
  };

  const boardContextValue = {
    activeToolItem : boardState.activeToolItem,
    handleToolItemClick,
  }

  return (
    <boardContext.Provider value={boardContextValue}>
        {children}
    </boardContext.Provider>
  )
}

export default BoardProvider;