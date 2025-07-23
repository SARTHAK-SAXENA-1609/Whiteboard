import React from 'react'
import { useState } from 'react';
import classes from './index.module.css' 
const Toolbar = () => {
  const [activeTool , setActiveTool] = useState("A");
  
  return (
    <div className = {classes.container} >
        <div className = { 
          (classes.toolItem , { [classes.active]: activeTool === "A" })
        } >
             A 
        </div>
        <div className = {classes.toolItem} > B </div>
    </div>
  )
}

export default Toolbar