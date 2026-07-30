const express = require("express");
const router = express.Router();
const { getPublicProfile } = require("../controllers/publicProfileController");

router.get("/:slug", getPublicProfile);

module.exports = router;
