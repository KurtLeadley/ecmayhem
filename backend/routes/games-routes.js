const app = require('express');
// use our stats-controller functions when reaching the following routes below
const GamesController = require("../controllers/game-controller");
// use express router
const router = app.Router();

router.get('/:season', GamesController.getGames);
router.put('/update', GamesController.updateManyGames);

module.exports = router;
