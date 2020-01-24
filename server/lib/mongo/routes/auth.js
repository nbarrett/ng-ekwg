const express = require("express");
const controller = require("../controllers/auth");
const login = require("../controllers/login");
const resetPassword = require("../controllers/reset-password");
const forgotPassword = require("../controllers/forgot-password");
const router = express.Router();

router.post("/log", controller.logMember);
router.post("/logout", controller.logout);
router.post("/create", controller.createMember);
router.post("/login", login.login);
router.post("/audit-member-login", controller.auditMemberLogin);
router.post("/reset-password", resetPassword.resetPassword);
router.post("/forgot-password", forgotPassword.forgotPassword);
router.post("/refresh", controller.refresh);

module.exports = router;
