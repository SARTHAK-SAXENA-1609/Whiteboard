const express = require("express");
const router = express.Router();
const {addUser , getUser} = require('../controllers/userController');

router.get( '/' , getUser);
router.post( '/' , addUser);


module.exports = router;
 