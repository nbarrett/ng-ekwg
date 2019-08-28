const express = require("express");
const controllers = require("./meetup-controllers");
const router = express.Router();

router.get("/config", controllers.config);
router.get("/events", controllers.events);
router.get("/handle-auth", controllers.handleAuth);

module.exports = router;
