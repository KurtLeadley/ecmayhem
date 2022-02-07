const app = require('express');
// use our stats-controller functions when reaching the following routes below
const TeamController = require("../controllers/team-controller");
// use express router
const router = app.Router();
router.get('/:tid/:season', TeamController.getTeam);
router.put('/:tid/:season/:pid', TeamController.addPlayer);
// export router
module.exports = router;
