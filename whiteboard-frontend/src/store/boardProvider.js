import React, { useCallback, useReducer } from 'react';
import boardContext from './board-context';
import { BOARD_ACTIONS, TOOL_ACTION_TYPES, TOOL_ITEMS } from '../constants';
import { createElement, getSvgPathFromStroke, isPointNearElement } from '../utils/element';
import getStroke from 'perfect-freehand';

const boardReducer = (state, action) => {
  switch (action.type) {
    case BOARD_ACTIONS.CHANGE_TOOL: {
      return {
        ...state,
        activeToolItem: action.payload.tool,
      };
    }

    case BOARD_ACTIONS.CHANGE_ACTION_TYPE: {
      return {
        ...state,
        toolActionType: action.payload.actionType,
      };
    }

    case BOARD_ACTIONS.DRAW_DOWN: {
      const { clientX, clientY, stroke, fill, size } = action.payload;
      const newElement = createElement(
        state.elements.length,
        clientX,
        clientY,
        clientX,
        clientY,
        { type: state.activeToolItem, stroke, fill, size }
      );

      return {
        ...state,
        toolActionType: state.activeToolItem === TOOL_ITEMS.TEXT ? TOOL_ACTION_TYPES.WRITING : TOOL_ACTION_TYPES.DRAWING,
        elements: [...state.elements, newElement],
      };
    }

    case BOARD_ACTIONS.DRAW_MOVE: {
      const { clientX, clientY } = action.payload;
      const newElements = [...state.elements];
      const index = state.elements.length - 1;
      const { type } = newElements[index];

      switch (type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW:
          const { x1, y1, stroke, fill, size } = newElements[index];
          const newElement = createElement(
            index,
            x1,
            y1,
            clientX,
            clientY,
            { type: state.activeToolItem, stroke, fill, size }
          );
          newElements[index] = newElement;
          return {
            ...state,
            elements: newElements,
          };

        case TOOL_ITEMS.BRUSH: {
          newElements[index].points = [...newElements[index].points, { x: clientX, y: clientY }];
          newElements[index].path = new Path2D(getSvgPathFromStroke(getStroke(newElements[index].points)));
          return {
            ...state,
            elements: newElements,
          };
        }
        case TOOL_ITEMS.TEXT: {
            return state;
        }

        default:
          throw new Error("Type not recognized");
      }
    }

    case BOARD_ACTIONS.DRAW_UP: {
      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push([...state.elements]);
      return {
        ...state,
        history: newHistory,
        index: state.index + 1,
      };
    }

    case BOARD_ACTIONS.ERASE: {
      const { clientX, clientY } = action.payload;
      const newElements = state.elements.filter((element) => {
        return !isPointNearElement(element, clientX, clientY);
      });
      return {
        ...state,
        elements: newElements,
      };
    }

    case BOARD_ACTIONS.CHANGE_TEXT: {
      const index = state.elements.length - 1;
      const newElements = [...state.elements];
      newElements[index].text = action.payload.text;

      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(newElements);

      return {
        ...state,
        toolActionType: TOOL_ACTION_TYPES.NONE,
        elements: newElements,
        history: newHistory,
        index: state.index + 1,
      };
    }

    case BOARD_ACTIONS.UNDO: {
      if (state.index <= 0) return state;
      return {
        ...state,
        elements: state.history[state.index - 1],
        index: state.index - 1,
      };
    }

    case BOARD_ACTIONS.REDO: {
      if (state.index >= state.history.length - 1) return state;
      return {
        ...state,
        elements: state.history[state.index + 1],
        index: state.index + 1,
      };
    }

    default:
      return state;
  }
};

const initialBoardState = {
  activeToolItem: TOOL_ITEMS.BRUSH,
  toolActionType: TOOL_ACTION_TYPES.NONE,
  elements: [],
  history: [[]],
  index: 0,
};

const BoardProvider = ({ children }) => {
  const [boardState, distpatchBoardAction] = useReducer(
    boardReducer,
    initialBoardState
  );

  const changeToolHandler = (tool) => {
    distpatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TOOL,
      payload: {
        tool,
      },
    });
  };

  const boardMouseDownHandler = (event, toolboxState) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    const { clientX, clientY } = event;
    if (boardState.activeToolItem === TOOL_ITEMS.ERASER) {
      distpatchBoardAction({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: {
          actionType: TOOL_ACTION_TYPES.ERASING,
        },
      });
      return;
    }
    distpatchBoardAction({
      type: BOARD_ACTIONS.DRAW_DOWN,
      payload: {
        clientX,
        clientY,
        stroke: toolboxState[boardState.activeToolItem]?.stroke,
        fill: toolboxState[boardState.activeToolItem]?.fill,
        size: toolboxState[boardState.activeToolItem]?.size,
      },
    });
  };

  const boardMouseMoveHandler = (event) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    const { clientX, clientY } = event;
    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      distpatchBoardAction({
        type: BOARD_ACTIONS.DRAW_MOVE,
        payload: {
          clientX,
          clientY,
        },
      });
    } else if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
      distpatchBoardAction({
        type: BOARD_ACTIONS.ERASE,
        payload: {
          clientX,
          clientY,
        },
      });
    }
  };

  const boardMouseUpHandler = () => {
    const { toolActionType } = boardState;

    if (
      toolActionType === TOOL_ACTION_TYPES.DRAWING ||
      toolActionType === TOOL_ACTION_TYPES.ERASING
    ) {
      distpatchBoardAction({
        type: BOARD_ACTIONS.DRAW_UP,
      });
    }

    distpatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
      payload: {
        actionType: TOOL_ACTION_TYPES.NONE, 
      },
    });
  };

  const textAreaBlurHandler = (text) => {
    distpatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TEXT,
      payload: {
        text,
      },
    });
  };

  const boardUndoHandler = useCallback(() => {
    distpatchBoardAction({
      type: BOARD_ACTIONS.UNDO,
    });
  } , []);

  const boardRedoHandler = useCallback(() => {
    distpatchBoardAction({
      type: BOARD_ACTIONS.REDO,
    });
  },[]);

  const boardContextValue = {
    activeToolItem: boardState.activeToolItem,
    elements: boardState.elements,
    toolActionType: boardState.toolActionType,
    changeToolHandler,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    redo: boardRedoHandler,
    undo: boardUndoHandler,
  };

  return (
    <boardContext.Provider value={boardContextValue}>
      {children}
    </boardContext.Provider>
  );
};

export default BoardProvider;