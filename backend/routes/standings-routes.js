const app = require('express');
// use our stats-controller functions when reaching the following routes below
const StandingsController = require("../controllers/standings-controller");
// use express router
const router = app.Router();
router.get('/seasons', StandingsController.getSeasons);
router.get('/teams', StandingsController.getTeams);
router.get('/:season', StandingsController.getSeasonStandings);
// export router
module.exports = router;
