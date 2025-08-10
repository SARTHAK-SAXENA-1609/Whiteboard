const express = require("express");
const router = express.Router();
const {loginUser, registerUser ,  getUser} = require('../controllers/userController');
const {validateUser} = require('../middlewares/validation');
const {authMiddleware } = require('../middlewares/authMiddleware');

router.post( '/login' , validateUser ,  loginUser );
router.post( '/register' , validateUser , registerUser );
router.get('/me' ,authMiddleware ,   getUser);

module.exports = router;
 