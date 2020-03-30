const express = require("express");
const instagramAuthentication = {};
const instagram = require("./instagram-controllers")(instagramAuthentication);
const router = express.Router();

router.get("/authorise", instagram.authorise);
router.get("/authorise-ok", instagram.authoriseOK);
router.get("/handle-auth", instagram.handleAuth);
router.get("/recent-media", instagram.recentMedia);

module.exports = router;
