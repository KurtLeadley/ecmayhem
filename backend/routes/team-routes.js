const app = require('express');
// use our stats-controller functions when reaching the following routes below
const TeamController = require("../controllers/team-controller");
// use express router
const router = app.Router();
router.post('/create', TeamController.createTeams);
router.get('/', TeamController.getAllTeams);
router.get('/availableseasons', TeamController.getAvailableSeasons);
router.get('/:season', TeamController.getTeams);
router.get('/standings/:season', TeamController.getSeasonStandings);
router.get('/:tid/:season', TeamController.getTeam);
router.put('/:tid/:season/:pid', TeamController.addPlayer);
router.put('/add/players', TeamController.addPlayers);
router.put('/update', TeamController.updateManyTeams);
router.delete("/delete/:param", TeamController.delete);
// export router
module.exports = router;
