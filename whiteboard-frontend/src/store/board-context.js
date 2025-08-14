import { createContext, useContext } from "react";
import { TOOL_ACTION_TYPES, TOOLBOX_ACTIONS } from "../constants";

const boardContext =  createContext({
    isUserLoggedIn: false,
    activeToolItem : "",
    elements : [],
    history : [[]],
    index : 0,
    canvasId: "", 
    toolActionType : TOOL_ACTION_TYPES.NONE,
    boardMouseDownHandler : ()=> {},
    changeToolHandler : ()=>{},
    boardMouseMoveHandler : ()=>{},
    boardMouseUpHandler : ()=>{},
    setUserLoginStatus: () => {},
    setCanvasId: () => {},
    setElements: () => {},
})

export default boardContext;
