import React, { useCallback, useReducer , useEffect, useRef } from 'react';
import boardContext from './board-context';
import { BOARD_ACTIONS, TOOL_ACTION_TYPES, TOOL_ITEMS } from '../constants';
import { createElement, getSvgPathFromStroke, isPointNearElement } from '../utils/element';
import getStroke from 'perfect-freehand';
import { updateCanvas, fetchInitialCanvasElements } from "../utils/api";
const canvasId = "67a66a7c2475972d34655e4d";
// import { updateCanvas } from '../utils/api';

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
      // ✅ FIX: Guard clause to prevent crash on empty elements array
      if (!state.elements || state.elements.length === 0) {
        return state;
      }

      const { clientX, clientY } = action.payload;
      const newElements = [...state.elements];
      const index = state.elements.length - 1;
      
      // This line is now safe
      const { type } = newElements[index];

      switch (type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW: {
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
        }

        case TOOL_ITEMS.BRUSH: {
          // To avoid state mutation, we create a new object for the element being updated.
          const lastElement = newElements[index];

          // Add the new point to a new points array.
          const newPoints = [...lastElement.points, { x: clientX, y: clientY }];

          // Map points to the format expected by perfect-freehand: [x, y]
          const stroke = getStroke(newPoints.map(p => [p.x, p.y]));

          // Create a new element object with the updated points and path.
          newElements[index] = {
            ...lastElement,
            points: newPoints,
            path: new Path2D(getSvgPathFromStroke(stroke)),
          };
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
    case BOARD_ACTIONS.SET_HISTORY:
      return {
        ...state,
        history: [Array.isArray(action.payload.elements) ? action.payload.elements : []],
    }
    case BOARD_ACTIONS.SET_USER_LOGIN_STATUS:
      return {
        ...state,
        isUserLoggedIn: action.payload.isUserLoggedIn,
    }
    case BOARD_ACTIONS.SET_INITIAL_ELEMENTS: {
      return {
        ...state,
        elements: action.payload.elements,
        history: [action.payload.elements], 
      };
    }
    case BOARD_ACTIONS.SET_CANVAS_ID:
      return {
        ...state,
        canvasId: action.payload.canvasId,
      }
    case BOARD_ACTIONS.SET_CANVAS_ELEMENTS:
      return {
        ...state,
        elements: action.payload.elements,
      }

    default:
      return state;
  }
};

const isUserLoggedIn = !!localStorage.getItem("whiteboard_user_token");

const initialBoardState = {
  activeToolItem: TOOL_ITEMS.BRUSH,
  toolActionType: TOOL_ACTION_TYPES.NONE,
  elements: [],
  history: [[]],
  index: 0,
  canvasId: "",
  isUserLoggedIn: isUserLoggedIn,
};


const BoardProvider = ({ children }) => {
  const [boardState, dispatchBoardAction] = useReducer(
    boardReducer,
    initialBoardState
  );
  const debounceTimer = useRef(null);

  // ✨ NEW: useEffect for Auto-Saving Canvas ✨
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a new timer to save the canvas after 1.5 seconds of inactivity
    debounceTimer.current = setTimeout(() => {
      // We only save if there is a canvasId and at least one element
      if (boardState.canvasId && boardState.elements.length > 0) {
        const token = localStorage.getItem("whiteboard_user_token");
        console.log(`Autosaving canvas ${boardState.canvasId}...`);
        updateCanvas(boardState.canvasId, boardState.elements, token);
      }
    }, 1500); // 1.5 second delay

    // Cleanup function to clear the timer if the component unmounts
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [boardState.elements, boardState.canvasId]);

  const changeToolHandler = (tool) => {
    dispatchBoardAction({
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
      dispatchBoardAction({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: {
          actionType: TOOL_ACTION_TYPES.ERASING,
        },
      });
      return;
    }
    dispatchBoardAction({
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
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_MOVE,
        payload: {
          clientX,
          clientY,
        },
      });
    } else if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
      dispatchBoardAction({
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
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_UP,
      });
    }

    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
      payload: {
        actionType: TOOL_ACTION_TYPES.NONE, 
      },
    });
  };

  const textAreaBlurHandler = (text) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TEXT,
      payload: {
        text,
      },
    });
  };

  const boardUndoHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.UNDO,
    });
  } , []);

  const boardRedoHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.REDO,
    });
  },[]);

  const setCanvasId = useCallback((canvasId) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.SET_CANVAS_ID,
      payload: {
        canvasId,
      },
    });
  }, []);

  const setElements = useCallback((elements) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.SET_CANVAS_ELEMENTS,
      payload: {
        elements,
      },
    });
  }, []);
    // console.log("hello canvas")
  const setHistory = useCallback((elements) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.SET_HISTORY,
      payload: {
        elements,
      },
    });
  }, []);

  const setUserLoginStatus = useCallback((isUserLoggedIn) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.SET_USER_LOGIN_STATUS,
      payload: {
        isUserLoggedIn,
      },
    })
  }, []);

    const boardContextValue = {
    activeToolItem: boardState.activeToolItem,
    elements: boardState.elements,
    toolActionType: boardState.toolActionType,
    canvasId: boardState.canvasId,
    isUserLoggedIn: boardState.isUserLoggedIn,
    changeToolHandler,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    redo: boardRedoHandler,
    undo: boardUndoHandler,
    setCanvasId, 
    setElements,
    setHistory,
    setUserLoginStatus
  };

  
  return (
    <boardContext.Provider value={boardContextValue}>
      {children}
    </boardContext.Provider>
  );
};

export default BoardProvider;