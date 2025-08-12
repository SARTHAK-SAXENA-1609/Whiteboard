import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Board from "./Components/Board";
import Toolbar from "./Components/Toolbar";
import Toolbox from "./Components/Toolbox";
import Sidebar from "./Components/Sidebar";
import BoardProvider from "./store/boardProvider";
import ToolboxProvider from "./store/toolboxProvider";
import Login from "./Components/Login";
import Register from "./Components/Register";
import { useParams } from "react-router-dom";


function HomePage() {
  const { id } = useParams(); // Get the dynamic id
  return (
    <ToolboxProvider>
      <div className="app-container">
        <Toolbar />
        <Board id={id}/>
        <Toolbox />
        <Sidebar /> 
      </div>
    </ToolboxProvider>
  );
}

function App() {
  return (
    <BoardProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/:id" element={<HomePage />} /> 
        </Routes>
      </Router>
    </BoardProvider>
  );
}

export default App;