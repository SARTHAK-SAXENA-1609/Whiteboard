// utils/api.js
import axios from "axios";

const API_BASE_URL = "https://whiteboard-o9zj.onrender.com/canvas";

// ✅ FIXED: Pass canvasId, elements, and token as arguments.
// Do not read them from localStorage here.
export const updateCanvas = async (canvasId, elements, token) => {
  // Don't try to save if we don't have what we need.
  if (!canvasId || !token) {
    // console.log("Missing canvasId or token, skipping update.");
    return;
  }

  try {
    // Note: Your backend expects canvasId in the body, which is fine.
    const response = await axios.put(
      `${API_BASE_URL}/update`,
      { canvasId, elements },
      {
        headers: {
          // ✅ FIXED: Use the token passed into the function.
          // The header should be "Bearer <token>"
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Canvas updated successfully in the database!", response.data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating canvas:", error.response?.data || error.message);
  }
};

// ✅ FIXED: Pass canvasId and token as arguments.
export const fetchInitialCanvasElements = async (canvasId, token) => {
  try {
    console.log("fetching initial elements");
    const response = await axios.get(`${API_BASE_URL}/load/${canvasId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.elements;
  } catch (error) {
    console.error("Error fetching initial canvas elements:", error);
    return []; // Return an empty array on error
  }
};