
const app = require('express');
// use our stats-controller functions when reaching the following routes below
const StatsController = require("../controllers/stats-controller");
// use express router
const router = app.Router();
// Player Stats CRUD
router.get('/player/:player', StatsController.getSinglePlayerStats);
router.put('/player/:player', StatsController.insertPlayerStats);
router.put('/player/:playerId/:statsId', StatsController.updateStats);
router.put('/players', StatsController.updateManyStats);
router.delete('/player/:playerId/:statsId', StatsController.deletePlayerStats);
// Get cumulative Stats for season / team / player
router.get('/players', StatsController.getStats );
// get available seasons and teams
router.get('/seasons', StatsController.getSeasons);
// export router
module.exports = router;
