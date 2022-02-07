const app = require('express');
// use our stats-controller functions when reaching the following routes below
const PlayersController = require("../controllers/player-controller");
// use express router
const router = app.Router();

router.post("/create", PlayersController.createPlayer);
router.get("/", PlayersController.getPlayers);
module.exports = router;
