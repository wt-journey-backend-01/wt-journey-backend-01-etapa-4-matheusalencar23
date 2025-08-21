const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { newUserValidation } = require("../utils/userValidations");

router.post("/auth/register", newUserValidation, authController.signUp);
router.post("/auth/login", authController.login);

module.exports = router;
