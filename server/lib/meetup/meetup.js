const express = require("express");
const createEvent = require("./create-event");
const deleteEvent = require("./delete-event");
const updateEvent = require("./update-event");
const handleAuth = require("./handle-auth");
const config = require("./config");
const events = require("./events");
const locations = require("./locations");
const venues = require("./venues");
const router = express.Router();

router.get("/config", config.config);
router.delete("/events/delete/:eventId", deleteEvent.deleteEvent);
router.get("/events/:eventId", events.single);
router.get("/events", events.all);
router.patch("/events/update/:eventId", updateEvent.updateEvent);
router.post("/events/create", createEvent.createEvent);
router.post("/venues/create", venues.create);
router.get("/venues/list", venues.list);
router.get("/handle-auth", handleAuth.handleAuth);
router.get("/locations", locations.locations);

module.exports = router;
