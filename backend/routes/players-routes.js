const app = require('express');
// use our stats-controller functions when reaching the following routes below
const PlayersController = require("../controllers/player-controller");
// use express router
const router = app.Router();

router.post("/create", PlayersController.createPlayer);
router.post("/create/rosters", PlayersController.createRosters);
router.get("/", PlayersController.getPlayers);
router.get("/stats", PlayersController.getPlayerStats);
router.delete("/delete/:param",PlayersController.delete);
module.exports = router;
