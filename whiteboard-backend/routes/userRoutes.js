const express = require("express");
const router = express.Router();
const {addUser , getUser} = require('../controllers/userController');
const {validateUser} = require('../middlewares/validation');

router.get( '/login' , validateUser ,  getUser);
router.post( '/register' , validateUser ,  addUser);


module.exports = router;
 