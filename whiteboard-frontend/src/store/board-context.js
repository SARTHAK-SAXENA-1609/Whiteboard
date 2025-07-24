import { createContext, useContext } from "react";
import { TOOL_ACTION_TYPES, TOOLBOX_ACTIONS } from "../constants";

const boardContext =  createContext({
    activeToolItem : "",
    elements : [],
    toolActionType : TOOL_ACTION_TYPES.NONE,
    boardMouseDownHandler : ()=> {},
    changeToolHandler : ()=>{},
    boardMouseMoveHandler : ()=>{},
    boardMouseUpHandler : ()=>{},
})

export default boardContext;
