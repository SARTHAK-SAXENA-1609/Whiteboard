import { io } from "socket.io-client";

const token = localStorage.getItem("whiteboard_user_token");
const REACT_APP_BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

const socket = io(`${REACT_APP_BACKEND_API_URL}`, {
  extraHeaders: token ? { Authorization: `Bearer ${token}` } : {}, // Only send if token exists
});

export default socket;