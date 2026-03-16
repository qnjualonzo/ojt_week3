const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { signupRules, loginRules, validate } = require("../validators/authValidator");
const { authLimiter } = require("../middlewares/rateLimiter");

router.post("/signup", authLimiter, signupRules, validate, authController.signup);
router.post("/login", authLimiter, loginRules, validate, authController.login);

module.exports = router;