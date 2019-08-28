const express = require("express");
const router = express.Router();
let mongoProxy = require("./mongo-proxy")();

router.all("/:db/collections/:collection/:id*", mongoProxy);
router.all("/:db/collections/:collection*", mongoProxy);
router.all("/:db/runCommand", mongoProxy);

module.exports = router;
