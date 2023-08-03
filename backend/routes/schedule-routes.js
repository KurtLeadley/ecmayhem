const app = require('express');
// use our stats-controller functions when reaching the following routes below
const ScheduleController = require("../controllers/schedule-controller");
// use express router
const router = app.Router();

// router.post("/create", ScheduleController.createSchedule);
//router.get("/",ScheduleController.getSchedule);
router.get("/create/:season",ScheduleController.getGoogleRosters);
router.get("/get/seasons/:entity", ScheduleController.getGoogleSeasons);
router.get("/get/results/:season", ScheduleController.getGoogleResultSheets);
router.get("/get", ScheduleController.get);
router.post("/create", ScheduleController.createSeasonSchedule);
router.post("/create/google/results", ScheduleController.createGoogleResultsSheets);
// router.get("/:season", ScheduleController.getSeasonSchedule);
router.delete("/delete/:param", ScheduleController.delete);
module.exports = router;
