const router = require("express").Router();

router.use("/api/user", require("../controllers/UserController"))

module.exports = router