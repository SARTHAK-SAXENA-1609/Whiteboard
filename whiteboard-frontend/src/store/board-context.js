import { createContext, useContext } from "react";
import { TOOL_ACTION_TYPES, TOOLBOX_ACTIONS } from "../constants";

const boardContext =  createContext({
    activeToolItem : "",
    elements : [],
    history : [[]],
    index : 0,
    toolActionType : TOOL_ACTION_TYPES.NONE,
    boardMouseDownHandler : ()=> {},
    changeToolHandler : ()=>{},
    boardMouseMoveHandler : ()=>{},
    boardMouseUpHandler : ()=>{},
})

export default boardContext;
