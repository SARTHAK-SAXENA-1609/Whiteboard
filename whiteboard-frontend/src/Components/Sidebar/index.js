import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './index.min.css';
import { useNavigate, useParams } from 'react-router-dom';
import boardContext from '../../store/board-context';

const Sidebar = () => {
  const [canvases, setCanvases] = useState([]);
  const token = localStorage.getItem('whiteboard_user_token');
  const { canvasId, setCanvasId, setElements, setHistory, isUserLoggedIn, setUserLoginStatus } = useContext(boardContext);
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const initializeCanvases = async () => {
      if (isUserLoggedIn) {
        try {
          const response = await axios.get('http://localhost:3030/canvas/list', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const fetchedCanvases = response.data;
          setCanvases(fetchedCanvases);

          if (fetchedCanvases.length === 0) {
            handleCreateCanvas();
          } else if (paramId) {
            handleCanvasClick(paramId);
          } else {
            handleCanvasClick(fetchedCanvases[0]._id);
          }
        } catch (error) {
          console.error('Error initializing canvases:', error);
        }
      }
    };
    initializeCanvases();
  }, [isUserLoggedIn]);

  const handleCreateCanvas = async () => {
    try {
      const response = await axios.post('http://localhost:3030/canvas/create', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newCanvas = response.data;
      
      setElements([]);
      setHistory([]);
      setCanvasId(newCanvas.canvasId);
      navigate(`/${newCanvas.canvasId}`);
      setCanvases(prevCanvases => [...prevCanvases, { _id: newCanvas.canvasId }]);
    } catch (error) {
      console.error('Error creating canvas:', error);
    }
  };

  const handleCanvasClick = async (id) => {
    if (!id) return;

    try {
      // --- THIS IS THE CORRECTED LINE ---
      // Changed from /canvas/${id} to /canvas/load/${id} to match your backend API
      const response = await axios.get(`http://localhost:3030/canvas/load/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
      });

      setElements(response.data.elements || []);
      setHistory(response.data.elements || []);
      setCanvasId(id);
      navigate(`/${id}`);
    } catch (error) {
        console.error('Error fetching canvas data:', error);
        navigate('/');
    }
  };

  const handleDeleteCanvas = async (idToDelete) => {
    try {
      await axios.delete(`http://localhost:3030/canvas/delete/${idToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedCanvases = canvases.filter(c => c._id !== idToDelete);
      setCanvases(updatedCanvases);

      if (updatedCanvases.length > 0) {
        handleCanvasClick(updatedCanvases[0]._id);
      } else {
        handleCreateCanvas();
      }
    } catch (error) {
      console.error('Error deleting canvas:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('whiteboard_user_token');
    setCanvases([]);
    setElements([]);
    setHistory([]);
    setCanvasId(null);
    setUserLoginStatus(false);
    navigate('/');
  };

  const handleLogin = () => navigate('/login');

  const handleShare = async () => {
    if (!email.trim()) {
      setError("Please enter an email.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await axios.put(
        `http://localhost:3030/canvas/share/${canvasId}`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to share canvas.");
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div className="sidebar">
      <button 
        className="create-button" 
        onClick={handleCreateCanvas} 
        disabled={!isUserLoggedIn}
      >
        + Create New Canvas
      </button>
      <ul className="canvas-list">
        {canvases.map(canvas => (
          <li 
            key={canvas._id} 
            className={`canvas-item ${canvas._id === canvasId ? 'selected' : ''}`}
          >
            <span 
              className="canvas-name" 
              onClick={() => handleCanvasClick(canvas._id)}
            >
              Canvas {canvas._id.substring(0, 6)}...
            </span>
            <button className="delete-button" onClick={() => handleDeleteCanvas(canvas._id)}>
              del
            </button>
          </li>
        ))}
      </ul>
      
      <div className="share-container">
        <input
          type="email"
          placeholder="Enter user email to share"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!isUserLoggedIn || !canvasId}
        />
        <button className="share-button" onClick={handleShare} disabled={!isUserLoggedIn || !canvasId}>
          Share
        </button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>

      {isUserLoggedIn ? (
        <button className="auth-button logout-button" onClick={handleLogout}>
          Logout
        </button>
      ) : (
        <button className="auth-button login-button" onClick={handleLogin}>
          Login
        </button>
      )}
    </div>
  );
};

export default Sidebar;